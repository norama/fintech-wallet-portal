import type { AuthUserResponse, StartSignInResponse, VerifyCodeResponse } from '@/lib/types/api'
import type { StartSignInInput, VerifyCodeInput } from '@/lib/validation/authSchemas'

type ApiErrorResponse = {
  error?: {
    code?: string
    message?: string
  }
}

async function readJson<T>(response: Response) {
  const body = (await response.json().catch(() => null)) as T | ApiErrorResponse | null

  if (!response.ok) {
    const message =
      body && typeof body === 'object' && 'error' in body && body.error?.message
        ? body.error.message
        : 'Request failed'

    throw new Error(message)
  }

  return body as T
}

export async function getCurrentUser(): Promise<AuthUserResponse> {
  const response = await fetch('/api/auth/me', {
    credentials: 'include',
    cache: 'no-store',
  })

  return readJson<AuthUserResponse>(response)
}

export async function startSignIn(input: StartSignInInput) {
  const response = await fetch('/api/auth/start-sign-in', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(input),
  })

  return readJson<StartSignInResponse>(response)
}

export async function verifyCode(input: VerifyCodeInput) {
  const response = await fetch('/api/auth/verify-code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(input),
  })

  return readJson<VerifyCodeResponse>(response)
}

export async function signOut() {
  const response = await fetch('/api/auth/sign-out', {
    method: 'POST',
    credentials: 'include',
  })

  return readJson<{ success: true }>(response)
}
