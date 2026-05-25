'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { TransactionsRequestError } from '@/features/transactions/api/transactionsClient'
import { useTransactions } from '@/features/transactions/hooks/useTransactions'

export function TransactionsPageClient() {
  const router = useRouter()
  const transactionsQuery = useTransactions()

  useEffect(() => {
    if (
      transactionsQuery.error instanceof TransactionsRequestError &&
      transactionsQuery.error.status === 401
    ) {
      router.replace('/sign-in')
    }
  }, [transactionsQuery.error, router])

  const requestError =
    transactionsQuery.error instanceof TransactionsRequestError ? transactionsQuery.error : null
  const isUnauthorized = requestError?.status === 401
  const errorMessage = !isUnauthorized && requestError ? requestError.message : null

  return (
    <div className='space-y-6'>
      {transactionsQuery.isPending ? (
        <SkeletonCard
          tone='transaction'
          eyebrow='Transactions API'
          title='Loading transactions payload'
          description='Fetching the first page of server-scoped transaction history.'
          lines={[
            { widthClassName: 'w-40' },
            { widthClassName: 'w-full' },
            { widthClassName: 'w-11/12' },
            { widthClassName: 'w-10/12' },
          ]}
        />
      ) : null}

      {errorMessage ? (
        <Alert
          tone='danger'
          title='Transactions unavailable'
          description={errorMessage}
          action={
            <Button variant='secondary' size='sm' onClick={() => void transactionsQuery.refetch()}>
              Retry
            </Button>
          }
        />
      ) : null}

      {transactionsQuery.data ? (
        <Card
          tone='transaction'
          eyebrow='Transactions API'
          title='Raw transaction payload'
          description='This is the typed JSON response from /api/transactions using TanStack Query with default pagination.'>
          <pre className='overflow-x-auto rounded-2xl border border-violet-200 bg-white/70 p-4 text-xs leading-6 text-zinc-800'>
            {JSON.stringify(transactionsQuery.data, null, 2)}
          </pre>
        </Card>
      ) : null}
    </div>
  )
}
