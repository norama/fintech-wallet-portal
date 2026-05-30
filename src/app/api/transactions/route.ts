import { jsonError, jsonValidationError } from '@/lib/api/responses'
import { findActiveUserById } from '@/lib/auth/demoAuth'
import { readDemoSessionUserId } from '@/lib/auth/demoSession'
import type { TransactionRow, WalletRow } from '@/lib/supabase/database.types'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { TransactionsListItem, TransactionsListResponse } from '@/lib/types/api'
import {
  transactionListQuerySchema,
  type TransactionListQuery,
} from '@/lib/validation/transactionSchemas'

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

function buildSearchPattern(search: string) {
  const sanitized = sanitizeSearchTerm(search)

  return sanitized.length > 0 ? `%${sanitized}%` : null
}

function parseQuery(request: Request): TransactionListQuery | Response {
  const { searchParams } = new URL(request.url)
  const result = transactionListQuerySchema.safeParse(Object.fromEntries(searchParams.entries()))

  if (!result.success) {
    return jsonValidationError(result.error)
  }

  return result.data
}

function mapTransactionItem(
  transaction: TransactionRow,
  walletNameById: Map<string, string>,
): TransactionsListItem {
  return {
    id: transaction.id,
    accountId: transaction.account_id,
    walletId: transaction.wallet_id,
    walletName: walletNameById.get(transaction.wallet_id) ?? null,
    direction: transaction.direction,
    transactionType: transaction.transaction_type,
    counterpartyType: transaction.counterparty_type,
    counterpartyName: transaction.counterparty_name,
    counterpartyRef: transaction.counterparty_ref,
    amountMinor: transaction.amount_minor,
    currency: transaction.currency,
    status: transaction.status,
    reference: transaction.reference,
    paymentNote: transaction.payment_note,
    createdAt: transaction.created_at,
    completedAt: transaction.completed_at,
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

    const walletsQuery = await supabase
      .from('wallets')
      .select('id, name, currency, status')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false })

    if (walletsQuery.error) {
      throw new Error(`Failed to load transaction filters: ${walletsQuery.error.message}`)
    }

    const wallets: Array<Pick<WalletRow, 'id' | 'name' | 'currency' | 'status'>> =
      walletsQuery.data ?? []
    const walletNameById = new Map(wallets.map((wallet) => [wallet.id, wallet.name]))

    const from = (parsedQuery.page - 1) * parsedQuery.pageSize
    const to = from + parsedQuery.pageSize - 1

    let transactionsQuery = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('account_id', accountId)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (parsedQuery.walletId) {
      transactionsQuery = transactionsQuery.eq('wallet_id', parsedQuery.walletId)
    }

    if (parsedQuery.status) {
      transactionsQuery = transactionsQuery.eq('status', parsedQuery.status)
    }

    if (parsedQuery.direction) {
      transactionsQuery = transactionsQuery.eq('direction', parsedQuery.direction)
    }

    if (parsedQuery.transactionType) {
      transactionsQuery = transactionsQuery.eq('transaction_type', parsedQuery.transactionType)
    }

    if (parsedQuery.search) {
      const searchPattern = buildSearchPattern(parsedQuery.search)

      if (searchPattern) {
        transactionsQuery = transactionsQuery.or(
          `counterparty_name.ilike.${searchPattern},transaction_type.ilike.${searchPattern},status.ilike.${searchPattern},reference.ilike.${searchPattern},payment_note.ilike.${searchPattern}`,
        )
      }
    }

    const { data, error, count } = await transactionsQuery

    if (error) {
      throw new Error(`Failed to load transactions: ${error.message}`)
    }

    const items = (data ?? []).map((transaction) => mapTransactionItem(transaction, walletNameById))
    const totalCount = count ?? 0
    const pageCount = totalCount === 0 ? 0 : Math.ceil(totalCount / parsedQuery.pageSize)

    const response: TransactionsListResponse = {
      items,
      page: parsedQuery.page,
      pageSize: parsedQuery.pageSize,
      totalCount,
      pageCount,
      filters: {
        wallets,
      },
    }

    return Response.json(response)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load transactions'
    return jsonError(500, 'TRANSACTIONS_LOAD_FAILED', message)
  }
}
