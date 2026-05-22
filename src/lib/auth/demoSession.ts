import 'server-only'

import { cookies } from 'next/headers'

export const DEMO_SESSION_COOKIE_NAME = 'fintech_wallet_session'

const demoSessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 8,
}

export async function setDemoSessionCookie(userId: string) {
  const cookieStore = await cookies()

  cookieStore.set(DEMO_SESSION_COOKIE_NAME, userId, demoSessionCookieOptions)
}

export async function readDemoSessionUserId() {
  const cookieStore = await cookies()

  return cookieStore.get(DEMO_SESSION_COOKIE_NAME)?.value ?? null
}

export async function clearDemoSessionCookie() {
  const cookieStore = await cookies()

  cookieStore.delete(DEMO_SESSION_COOKIE_NAME)
}
