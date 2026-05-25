import type {
  TransactionDirection,
  TransactionStatus,
  TransactionType,
} from '@/lib/supabase/database.types'
import {
  transactionListQuerySchema,
  type TransactionListQuery,
} from '@/lib/validation/transactionSchemas'

export const DEFAULT_TRANSACTIONS_PAGE = 1
export const DEFAULT_TRANSACTIONS_PAGE_SIZE = 10

export const TRANSACTION_STATUS_OPTIONS = [
  'completed',
  'pending',
  'failed',
  'reversed',
  'requires_review',
] as const

export const TRANSACTION_DIRECTION_OPTIONS = ['incoming', 'outgoing'] as const

export const TRANSACTION_TYPE_OPTIONS = [
  'bank_transfer',
  'internal_transfer',
  'card_payment',
  'fee',
  'fx_conversion',
] as const

export type TransactionsQueryParams = {
  page?: number | undefined
  pageSize?: number | undefined
  search?: string | undefined
  walletId?: string | undefined
  status?: TransactionStatus | undefined
  direction?: TransactionDirection | undefined
  transactionType?: TransactionType | undefined
}

export type NormalizedTransactionsQueryParams = TransactionListQuery

export function normalizeTransactionsQueryParams(
  params: TransactionsQueryParams = {},
): NormalizedTransactionsQueryParams {
  return transactionListQuerySchema.parse(params)
}

export function parseTransactionsSearchParams(searchParams: URLSearchParams) {
  const result = transactionListQuerySchema.safeParse(Object.fromEntries(searchParams.entries()))

  if (!result.success) {
    return normalizeTransactionsQueryParams()
  }

  return result.data
}

export function toTransactionsSearchParams(params: TransactionsQueryParams = {}) {
  const normalized = normalizeTransactionsQueryParams(params)
  const searchParams = new URLSearchParams()

  if (normalized.page !== DEFAULT_TRANSACTIONS_PAGE) {
    searchParams.set('page', String(normalized.page))
  }

  if (normalized.pageSize !== DEFAULT_TRANSACTIONS_PAGE_SIZE) {
    searchParams.set('pageSize', String(normalized.pageSize))
  }

  if (normalized.search) {
    searchParams.set('search', normalized.search)
  }

  if (normalized.walletId) {
    searchParams.set('walletId', normalized.walletId)
  }

  if (normalized.status) {
    searchParams.set('status', normalized.status)
  }

  if (normalized.direction) {
    searchParams.set('direction', normalized.direction)
  }

  if (normalized.transactionType) {
    searchParams.set('transactionType', normalized.transactionType)
  }

  return searchParams
}

export type { TransactionsListResponse } from '@/lib/types/api'
