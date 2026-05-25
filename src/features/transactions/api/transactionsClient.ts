import type {
  TransactionsListResponse,
  TransactionsQueryParams,
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

function buildTransactionsUrl(params: TransactionsQueryParams = {}) {
  const searchParams = new URLSearchParams()

  if (params.page !== undefined) {
    searchParams.set('page', String(params.page))
  }

  if (params.pageSize !== undefined) {
    searchParams.set('pageSize', String(params.pageSize))
  }

  if (params.search) {
    searchParams.set('search', params.search)
  }

  if (params.walletId) {
    searchParams.set('walletId', params.walletId)
  }

  if (params.status) {
    searchParams.set('status', params.status)
  }

  if (params.direction) {
    searchParams.set('direction', params.direction)
  }

  if (params.transactionType) {
    searchParams.set('transactionType', params.transactionType)
  }

  const queryString = searchParams.toString()

  return queryString.length > 0 ? `/api/transactions?${queryString}` : '/api/transactions'
}

export async function fetchTransactions(params: TransactionsQueryParams = {}) {
  const response = await fetch(buildTransactionsUrl(params), {
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
