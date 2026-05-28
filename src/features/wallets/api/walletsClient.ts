import type { WalletsListResponse, WalletsQueryParams } from '@/features/wallets/types'
import { normalizeWalletsQueryParams, toWalletsSearchParams } from '@/features/wallets/types'

type WalletsApiErrorResponse = {
  error?: {
    code?: string
    message?: string
  }
}

export class WalletsRequestError extends Error {
  status: number
  code: string | null

  constructor(message: string, status: number, code: string | null = null) {
    super(message)
    this.name = 'WalletsRequestError'
    this.status = status
    this.code = code
  }
}

function buildWalletsUrl(params: WalletsQueryParams) {
  const searchParams = toWalletsSearchParams(params)
  const queryString = searchParams.toString()

  return queryString.length > 0 ? `/api/wallets?${queryString}` : '/api/wallets'
}

export async function fetchWallets(params: WalletsQueryParams = {}) {
  const normalized = normalizeWalletsQueryParams(params)

  const response = await fetch(buildWalletsUrl(normalized), {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  })

  const body = (await response.json().catch(() => null)) as
    | WalletsListResponse
    | WalletsApiErrorResponse
    | null

  if (!response.ok) {
    const code =
      body && typeof body === 'object' && 'error' in body && body.error?.code
        ? body.error.code
        : null
    const message =
      body && typeof body === 'object' && 'error' in body && body.error?.message
        ? body.error.message
        : 'Unable to load wallets'

    throw new WalletsRequestError(message, response.status, code)
  }

  return body as WalletsListResponse
}
