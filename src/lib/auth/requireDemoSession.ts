import 'server-only'

import { redirect } from 'next/navigation'

import { readDemoSessionUserId } from '@/lib/auth/demoSession'

export async function requireDemoSessionUserId() {
  const sessionUserId = await readDemoSessionUserId()

  if (!sessionUserId) {
    redirect('/sign-in')
  }

  return sessionUserId
}
