import { redirect } from 'next/navigation'

import { SignInForm } from '@/features/auth/components/SignInForm'
import { readDemoSessionUserId } from '@/lib/auth/demoSession'

export default async function SignInPage() {
  const sessionUserId = await readDemoSessionUserId()

  if (sessionUserId) {
    redirect('/dashboard')
  }

  return (
    <main className='flex min-h-screen items-center justify-center bg-zinc-100 px-6 py-16'>
      <SignInForm />
    </main>
  )
}
