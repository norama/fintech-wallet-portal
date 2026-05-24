'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { signOut } from '@/features/auth/api/authClient'
import {
  DashboardRequestError,
  dashboardQueryKey,
  fetchDashboard,
} from '@/features/dashboard/api/dashboardClient'
import type { DashboardResponse } from '@/lib/types/api'

export function RawDashboardJson() {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState<string | null>(null)
  const dashboardQuery = useQuery<DashboardResponse, DashboardRequestError>({
    queryKey: dashboardQueryKey,
    queryFn: fetchDashboard,
  })

  useEffect(() => {
    if (dashboardQuery.error?.status === 401) {
      router.replace('/sign-in')
    }
  }, [dashboardQuery.error, router])

  async function handleSignOut() {
    setIsSigningOut(true)
    setSignOutError(null)

    try {
      await signOut()
      router.push('/sign-in')
      router.refresh()
    } catch (signOutError) {
      setSignOutError(signOutError instanceof Error ? signOutError.message : 'Unable to sign out')
      setIsSigningOut(false)
    }
  }

  const isUnauthorized = dashboardQuery.error?.status === 401
  const errorMessage =
    signOutError ?? (!isUnauthorized && dashboardQuery.error ? dashboardQuery.error.message : null)

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

      {dashboardQuery.isPending ? (
        <p className='mt-6 text-sm text-zinc-600'>Loading dashboard...</p>
      ) : null}
      {errorMessage ? <p className='mt-6 text-sm text-red-600'>{errorMessage}</p> : null}

      {dashboardQuery.data ? (
        <pre className='mt-6 overflow-x-auto rounded-3xl bg-zinc-950 p-6 text-sm leading-7 text-zinc-100'>
          {JSON.stringify(dashboardQuery.data, null, 2)}
        </pre>
      ) : null}
    </section>
  )
}
