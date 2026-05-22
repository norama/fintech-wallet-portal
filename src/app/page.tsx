import { redirect } from 'next/navigation'

import { readDemoSessionUserId } from '@/lib/auth/demoSession'

export default async function Home() {
  const sessionUserId = await readDemoSessionUserId()

  redirect(sessionUserId ? '/dashboard' : '/sign-in')
}
