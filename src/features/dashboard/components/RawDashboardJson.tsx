'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { DashboardRequestError } from '@/features/dashboard/api/dashboardClient'
import { getSignOutMutationOptions } from '@/lib/query/authQuery'
import { getDashboardQueryOptions } from '@/lib/query/dashboardQuery'

export function RawDashboardJson() {
  const router = useRouter()
  const dashboardQuery = useQuery(getDashboardQueryOptions())
  const signOutMutation = useMutation({
    ...getSignOutMutationOptions(),
    onSuccess: async () => {
      await router.push('/sign-in')
      router.refresh()
    },
  })

  useEffect(() => {
    if (
      dashboardQuery.error instanceof DashboardRequestError &&
      dashboardQuery.error.status === 401
    ) {
      router.replace('/sign-in')
    }
  }, [dashboardQuery.error, router])

  async function handleSignOut() {
    await signOutMutation.mutateAsync()
  }

  const dashboardError =
    dashboardQuery.error instanceof DashboardRequestError ? dashboardQuery.error : null
  const isUnauthorized = dashboardError?.status === 401
  const errorMessage =
    signOutMutation.error?.message ??
    (!isUnauthorized && dashboardError ? dashboardError.message : null)

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
          disabled={signOutMutation.isPending}
          className='cursor-pointer rounded-2xl border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:border-zinc-950 hover:text-zinc-950 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-400'>
          {signOutMutation.isPending ? 'Signing out...' : 'Sign out'}
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
