import { jsonError, jsonValidationError, toCamelCaseDeep } from '@/lib/api/responses'
import { findActiveUserByEmail, findActiveUserById } from '@/lib/auth/demoAuth'
import { readDemoSessionUserId } from '@/lib/auth/demoSession'
import type { CurrencyCode, PaymentContactRow } from '@/lib/supabase/database.types'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { ContactsListItem, ContactsListResponse } from '@/lib/types/api'
import {
  contactCreateBodySchema,
  contactListQuerySchema,
  type ContactListQuery,
} from '@/lib/validation/contactSchemas'

export const dynamic = 'force-dynamic'

function getUnauthenticatedResponse() {
  return jsonError(401, 'UNAUTHENTICATED', 'Please sign in.')
}

function parseQuery(request: Request): ContactListQuery | Response {
  const { searchParams } = new URL(request.url)
  const result = contactListQuerySchema.safeParse(Object.fromEntries(searchParams.entries()))

  if (!result.success) {
    return jsonValidationError(result.error)
  }

  return result.data
}

async function enrichContactRows(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  contactRows: PaymentContactRow[],
): Promise<ContactsListItem[]> {
  if (contactRows.length === 0) return []

  const targetAccountIds = contactRows.map((row) => row.target_account_id)

  const [usersResult, walletsResult] = await Promise.all([
    supabase.from('users').select('account_id, email').in('account_id', targetAccountIds),
    supabase
      .from('wallets')
      .select('account_id, currency')
      .in('account_id', targetAccountIds)
      .eq('is_primary', true),
  ])

  if (usersResult.error) {
    throw new Error(`Failed to load contact emails: ${usersResult.error.message}`)
  }

  if (walletsResult.error) {
    throw new Error(`Failed to load contact currencies: ${walletsResult.error.message}`)
  }

  const emailByAccountId = new Map((usersResult.data ?? []).map((u) => [u.account_id, u.email]))

  const currenciesByAccountId = new Map<string, CurrencyCode[]>()
  for (const wallet of walletsResult.data ?? []) {
    const existing = currenciesByAccountId.get(wallet.account_id) ?? []
    currenciesByAccountId.set(wallet.account_id, [...existing, wallet.currency])
  }

  const enriched = contactRows.map((row) => ({
    ...row,
    target_email: emailByAccountId.get(row.target_account_id) ?? '',
    target_currencies: currenciesByAccountId.get(row.target_account_id) ?? [],
  }))

  return toCamelCaseDeep(enriched) as ContactsListItem[]
}

export async function GET(request: Request) {
  const parsedQuery = parseQuery(request)

  if (parsedQuery instanceof Response) {
    return parsedQuery
  }

  const sessionUserId = await readDemoSessionUserId()

  if (!sessionUserId) {
    return getUnauthenticatedResponse()
  }

  try {
    const user = await findActiveUserById(sessionUserId)

    if (!user) {
      return getUnauthenticatedResponse()
    }

    const supabase = createSupabaseServerClient()

    const from = (parsedQuery.page - 1) * parsedQuery.pageSize
    const to = from + parsedQuery.pageSize - 1

    const contactsResult = await supabase
      .from('payment_contacts')
      .select('*', { count: 'exact' })
      .eq('owner_account_id', user.account_id)
      .order('nickname', { ascending: true })
      .range(from, to)

    if (contactsResult.error) {
      throw new Error(`Failed to load contacts: ${contactsResult.error.message}`)
    }

    const contactRows: PaymentContactRow[] = contactsResult.data ?? []
    const totalCount = contactsResult.count ?? 0
    const pageCount = totalCount === 0 ? 0 : Math.ceil(totalCount / parsedQuery.pageSize)

    const items = await enrichContactRows(supabase, contactRows)

    const response: ContactsListResponse = {
      items,
      page: parsedQuery.page,
      pageSize: parsedQuery.pageSize,
      totalCount,
      pageCount,
    }

    return Response.json(response)
  } catch (error) {
    console.error('[GET /api/contacts]', error)

    return jsonError(500, 'INTERNAL_ERROR', 'Unable to load contacts.')
  }
}

export async function POST(request: Request) {
  const sessionUserId = await readDemoSessionUserId()

  if (!sessionUserId) {
    return getUnauthenticatedResponse()
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonError(400, 'INVALID_JSON', 'Request body must be valid JSON.')
  }

  const parsed = contactCreateBodySchema.safeParse(body)
  if (!parsed.success) {
    return jsonValidationError(parsed.error)
  }

  try {
    const user = await findActiveUserById(sessionUserId)

    if (!user) {
      return getUnauthenticatedResponse()
    }

    const targetUser = await findActiveUserByEmail(parsed.data.email)

    if (!targetUser) {
      return jsonError(404, 'USER_NOT_FOUND', 'No active user found with that email address.')
    }

    if (targetUser.account_id === user.account_id) {
      return jsonError(400, 'SELF_CONTACT', 'You cannot add yourself as a contact.')
    }

    const supabase = createSupabaseServerClient()

    const insertResult = await supabase
      .from('payment_contacts')
      .insert({
        owner_account_id: user.account_id,
        target_account_id: targetUser.account_id,
        nickname: parsed.data.nickname,
        status: 'active' as const,
      })
      .select('*')
      .single()

    if (insertResult.error) {
      // Unique constraint violation
      if (insertResult.error.code === '23505') {
        return jsonError(409, 'DUPLICATE_CONTACT', 'This contact already exists.')
      }

      throw new Error(`Failed to create contact: ${insertResult.error.message}`)
    }

    const primaryWalletsResult = await supabase
      .from('wallets')
      .select('currency')
      .eq('account_id', targetUser.account_id)
      .eq('is_primary', true)

    if (primaryWalletsResult.error) {
      throw new Error(`Failed to load target currencies: ${primaryWalletsResult.error.message}`)
    }

    const enriched = {
      ...insertResult.data,
      target_email: targetUser.email,
      target_currencies: (primaryWalletsResult.data ?? []).map((w) => w.currency),
    }

    const contact = toCamelCaseDeep(enriched) as ContactsListItem

    return Response.json(contact, { status: 201 })
  } catch (error) {
    console.error('[POST /api/contacts]', error)

    return jsonError(500, 'INTERNAL_ERROR', 'Unable to create contact.')
  }
}
