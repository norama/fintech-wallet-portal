'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { signOut } from '@/features/auth/api/authClient'
import { fetchDashboard } from '@/features/dashboard/api/dashboardClient'
import type { DashboardResponse } from '@/lib/types/api'

export function RawDashboardJson() {
  const router = useRouter()
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      setIsLoading(true)
      setError(null)

      try {
        const result = await fetchDashboard()

        if (!isMounted) {
          return
        }

        if (result.status === 401) {
          router.replace('/sign-in')
          return
        }

        setDashboard(result.data)
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        setError(loadError instanceof Error ? loadError.message : 'Unable to load dashboard')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadDashboard()

    return () => {
      isMounted = false
    }
  }, [router])

  async function handleSignOut() {
    setIsSigningOut(true)
    setError(null)

    try {
      await signOut()
      router.push('/sign-in')
      router.refresh()
    } catch (signOutError) {
      setError(signOutError instanceof Error ? signOutError.message : 'Unable to sign out')
      setIsSigningOut(false)
    }
  }

  return (
    <section className='w-full max-w-5xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8'>
      <div className='flex flex-col gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <p className='text-sm font-medium uppercase tracking-[0.2em] text-zinc-500'>Dashboard</p>
          <h1 className='mt-2 text-3xl font-semibold tracking-tight text-zinc-950'>
            Raw API Payload
          </h1>
        </div>

        <button
          type='button'
          onClick={handleSignOut}
          disabled={isSigningOut}
          className='cursor-pointer rounded-2xl border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:border-zinc-950 hover:text-zinc-950 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-400'>
          {isSigningOut ? 'Signing out...' : 'Sign out'}
        </button>
      </div>

      {isLoading ? <p className='mt-6 text-sm text-zinc-600'>Loading dashboard...</p> : null}
      {error ? <p className='mt-6 text-sm text-red-600'>{error}</p> : null}

      {dashboard ? (
        <pre className='mt-6 overflow-x-auto rounded-3xl bg-zinc-950 p-6 text-sm leading-7 text-zinc-100'>
          {JSON.stringify(dashboard, null, 2)}
        </pre>
      ) : null}
    </section>
  )
}
