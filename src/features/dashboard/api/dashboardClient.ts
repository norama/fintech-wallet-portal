import type { DashboardResponse } from '@/lib/types/api'

export type { DashboardResponse } from '@/lib/types/api'

type DashboardApiErrorResponse = {
  error?: {
    code?: string
    message?: string
  }
}

export class DashboardRequestError extends Error {
  status: number
  code: string | null

  constructor(message: string, status: number, code: string | null = null) {
    super(message)
    this.name = 'DashboardRequestError'
    this.status = status
    this.code = code
  }
}

export async function fetchDashboard() {
  const response = await fetch('/api/dashboard', {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  })

  const body = (await response.json().catch(() => null)) as
    | DashboardResponse
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
        : 'Unable to load dashboard'

    throw new DashboardRequestError(message, response.status, code)
  }

  return body as DashboardResponse
}
