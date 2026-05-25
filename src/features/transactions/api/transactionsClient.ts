import type {
  NormalizedTransactionsQueryParams,
  TransactionsListResponse,
  TransactionsQueryParams,
} from '@/features/transactions/types'
import {
  normalizeTransactionsQueryParams,
  toTransactionsSearchParams,
} from '@/features/transactions/types'

type TransactionsApiErrorResponse = {
  error?: {
    code?: string
    message?: string
  }
}

export class TransactionsRequestError extends Error {
  status: number
  code: string | null

  constructor(message: string, status: number, code: string | null = null) {
    super(message)
    this.name = 'TransactionsRequestError'
    this.status = status
    this.code = code
  }
}

function buildTransactionsUrl(params: NormalizedTransactionsQueryParams) {
  const searchParams = toTransactionsSearchParams(params)
  const queryString = searchParams.toString()

  return queryString.length > 0 ? `/api/transactions?${queryString}` : '/api/transactions'
}

export async function fetchTransactions(params: TransactionsQueryParams = {}) {
  const normalized = normalizeTransactionsQueryParams(params)

  const response = await fetch(buildTransactionsUrl(normalized), {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  })

  const body = (await response.json().catch(() => null)) as
    | TransactionsListResponse
    | TransactionsApiErrorResponse
    | null

  if (!response.ok) {
    const code =
      body && typeof body === 'object' && 'error' in body && body.error?.code
        ? body.error.code
        : null
    const message =
      body && typeof body === 'object' && 'error' in body && body.error?.message
        ? body.error.message
        : 'Unable to load transactions'

    throw new TransactionsRequestError(message, response.status, code)
  }

  return body as TransactionsListResponse
}
