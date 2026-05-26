import type { OverviewResponse } from '@/lib/types/api'

export type { OverviewResponse } from '@/lib/types/api'

type DashboardApiErrorResponse = {
  error?: {
    code?: string
    message?: string
  }
}

export class OverviewRequestError extends Error {
  status: number
  code: string | null

  constructor(message: string, status: number, code: string | null = null) {
    super(message)
    this.name = 'OverviewRequestError'
    this.status = status
    this.code = code
  }
}

export async function fetchOverview() {
  const response = await fetch('/api/dashboard', {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  })

  const body = (await response.json().catch(() => null)) as
    | OverviewResponse
    | DashboardApiErrorResponse
    | null

  if (!response.ok) {
    const code =
      body && typeof body === 'object' && 'error' in body && body.error?.code
        ? body.error.code
        : null
    const message =
      body && typeof body === 'object' && 'error' in body && body.error?.message
        ? body.error.message
        : 'Unable to load overview'

    throw new OverviewRequestError(message, response.status, code)
  }

  return body as OverviewResponse
}
