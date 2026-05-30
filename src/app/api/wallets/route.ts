import { jsonError, jsonValidationError, toCamelCaseDeep } from '@/lib/api/responses'
import { findActiveUserById } from '@/lib/auth/demoAuth'
import { readDemoSessionUserId } from '@/lib/auth/demoSession'
import type { CurrencyCode, WalletRow, WalletStatus } from '@/lib/supabase/database.types'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { WalletsListItem, WalletsListResponse, WalletsSummary } from '@/lib/types/api'
import {
  walletCreateBodySchema,
  walletListQuerySchema,
  type WalletListQuery,
} from '@/lib/validation/walletSchemas'

export const dynamic = 'force-dynamic'

function getUnauthenticatedResponse() {
  return jsonError(401, 'UNAUTHENTICATED', 'Please sign in.')
}

function sanitizeSearchTerm(search: string) {
  return search
    .replace(/[,%()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseQuery(request: Request): WalletListQuery | Response {
  const { searchParams } = new URL(request.url)
  const result = walletListQuerySchema.safeParse(Object.fromEntries(searchParams.entries()))

  if (!result.success) {
    return jsonValidationError(result.error)
  }

  return result.data
}

function computeSummary(rows: WalletRow[]): WalletsSummary {
  const totalReservedByCurrency: Partial<Record<CurrencyCode, number>> = {}
  const currencySet = new Set<CurrencyCode>()
  let activeWallets = 0
  let limitedWallets = 0
  let suspendedWallets = 0

  for (const row of rows) {
    currencySet.add(row.currency)
    const current = totalReservedByCurrency[row.currency] ?? 0
    totalReservedByCurrency[row.currency] = current + row.reserved_balance_minor

    if (row.status === 'active') activeWallets++
    else if (row.status === 'limited') limitedWallets++
    else if (row.status === 'suspended') suspendedWallets++
  }

  return {
    totalWallets: rows.length,
    activeWallets,
    limitedWallets,
    suspendedWallets,
    currencies: Array.from(currencySet),
    totalReservedByCurrency,
  }
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
    const accountId = user.account_id

    const allWalletsResult = await supabase
      .from('wallets')
      .select('*')
      .eq('account_id', accountId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false })

    if (allWalletsResult.error) {
      throw new Error(`Failed to load wallets: ${allWalletsResult.error.message}`)
    }

    const allRows: WalletRow[] = allWalletsResult.data ?? []
    const summary = computeSummary(allRows)

    let filteredRows = allRows

    if (parsedQuery.search) {
      const pattern = sanitizeSearchTerm(parsedQuery.search).toLowerCase()
      filteredRows = filteredRows.filter(
        (row) =>
          row.name.toLowerCase().includes(pattern) ||
          row.currency.toLowerCase().includes(pattern) ||
          row.status.toLowerCase().includes(pattern),
      )
    }

    if (parsedQuery.currency) {
      filteredRows = filteredRows.filter((row) => row.currency === parsedQuery.currency)
    }

    if (parsedQuery.status) {
      filteredRows = filteredRows.filter(
        (row): row is WalletRow & { status: WalletStatus } => row.status === parsedQuery.status,
      )
    }

    if (parsedQuery.isPrimary) {
      filteredRows = filteredRows.filter((row) => row.is_primary)
    }

    const totalCount = filteredRows.length
    const pageCount = totalCount === 0 ? 0 : Math.ceil(totalCount / parsedQuery.pageSize)
    const from = (parsedQuery.page - 1) * parsedQuery.pageSize
    const pagedRows = filteredRows.slice(from, from + parsedQuery.pageSize)

    const items = toCamelCaseDeep(pagedRows) as WalletsListItem[]

    const response: WalletsListResponse = {
      items,
      summary,
      page: parsedQuery.page,
      pageSize: parsedQuery.pageSize,
      totalCount,
      pageCount,
    }

    return Response.json(response)
  } catch (error) {
    console.error('[GET /api/wallets]', error)

    return jsonError(500, 'INTERNAL_ERROR', 'Unable to load wallets.')
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
    return jsonError(400, 'INVALID_JSON', 'Request body must be valid JSON')
  }

  const parsed = walletCreateBodySchema.safeParse(body)
  if (!parsed.success) {
    return jsonValidationError(parsed.error)
  }

  try {
    const user = await findActiveUserById(sessionUserId)

    if (!user) {
      return getUnauthenticatedResponse()
    }

    const supabase = createSupabaseServerClient()

    // First wallet in this currency for the account becomes primary
    const existingCountResult = await supabase
      .from('wallets')
      .select('id', { count: 'exact', head: true })
      .eq('account_id', user.account_id)
      .eq('currency', parsed.data.currency)

    if (existingCountResult.error) {
      throw new Error(`Failed to check existing wallets: ${existingCountResult.error.message}`)
    }

    const isPrimary = (existingCountResult.count ?? 0) === 0

    const insertResult = await supabase
      .from('wallets')
      .insert({
        account_id: user.account_id,
        name: parsed.data.name,
        currency: parsed.data.currency,
        balance_minor: 0,
        available_balance_minor: 0,
        reserved_balance_minor: 0,
        status: 'active' as const,
        is_primary: isPrimary,
      })
      .select('*')
      .single()

    if (insertResult.error) {
      throw new Error(`Failed to create wallet: ${insertResult.error.message}`)
    }

    const wallet = toCamelCaseDeep(insertResult.data) as WalletsListItem

    return Response.json(wallet, { status: 201 })
  } catch (error) {
    console.error('[POST /api/wallets]', error)

    return jsonError(500, 'INTERNAL_ERROR', 'Unable to create wallet.')
  }
}
