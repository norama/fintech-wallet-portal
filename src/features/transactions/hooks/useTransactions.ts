'use client'

import { queryOptions, useQuery } from '@tanstack/react-query'

import { fetchTransactions } from '@/features/transactions/api/transactionsClient'
import type { TransactionsQueryParams } from '@/features/transactions/types'

function normalizeTransactionsQueryParams(params: TransactionsQueryParams = {}) {
  return {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 10,
    search: params.search?.trim() || undefined,
    walletId: params.walletId,
    status: params.status,
    direction: params.direction,
    transactionType: params.transactionType,
  }
}

export const transactionsQueryKeys = {
  list: (params: TransactionsQueryParams = {}) => {
    const normalized = normalizeTransactionsQueryParams(params)

    return [
      'transactions',
      normalized.page,
      normalized.pageSize,
      normalized.search ?? '',
      normalized.walletId ?? '',
      normalized.status ?? '',
      normalized.direction ?? '',
      normalized.transactionType ?? '',
    ] as const
  },
} as const

export function getTransactionsQueryOptions(params: TransactionsQueryParams = {}) {
  const normalized = normalizeTransactionsQueryParams(params)

  return queryOptions({
    queryKey: transactionsQueryKeys.list(normalized),
    queryFn: () => fetchTransactions(normalized),
  })
}

export function useTransactions(params: TransactionsQueryParams = {}) {
  return useQuery(getTransactionsQueryOptions(params))
}
