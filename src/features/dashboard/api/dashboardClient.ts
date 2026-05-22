type DashboardApiError = {
  error?: {
    code?: string
    message?: string
  }
}

export type DashboardResponse = {
  user: Record<string, unknown>
  company: Record<string, unknown> | null
  wallets: Record<string, unknown>[]
  transactions: Record<string, unknown>[]
}

export async function fetchDashboard() {
  const response = await fetch('/api/dashboard', {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  })

  if (response.status === 401) {
    return {
      status: 401 as const,
      data: null,
      message: 'Unauthorized',
    }
  }

  const body = (await response.json().catch(() => null)) as
    | DashboardResponse
    | DashboardApiError
    | null

  if (!response.ok) {
    const message =
      body && typeof body === 'object' && 'error' in body && body.error?.message
        ? body.error.message
        : 'Unable to load dashboard'

    throw new Error(message)
  }

  return {
    status: 200 as const,
    data: body as DashboardResponse,
    message: null,
  }
}
