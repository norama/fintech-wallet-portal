'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { TransactionsRequestError } from '@/features/transactions/api/transactionsClient'
import { TransactionFilters } from '@/features/transactions/components/TransactionFilters'
import { TransactionsHistoryView } from '@/features/transactions/components/TransactionsHistoryView'
import { useTransactions } from '@/features/transactions/hooks/useTransactions'
import {
  DEFAULT_TRANSACTIONS_PAGE,
  DEFAULT_TRANSACTIONS_PAGE_SIZE,
  parseTransactionsSearchParams,
  toTransactionsSearchParams,
  type TransactionsQueryParams,
} from '@/features/transactions/types'

export function Transactions() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeFilters = parseTransactionsSearchParams(new URLSearchParams(searchParams.toString()))
  const transactionsQuery = useTransactions(activeFilters)

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
  const wallets = transactionsQuery.data?.filters.wallets ?? []
  const hasActiveFilters =
    activeFilters.search !== undefined ||
    activeFilters.walletId !== undefined ||
    activeFilters.status !== undefined ||
    activeFilters.direction !== undefined ||
    activeFilters.transactionType !== undefined

  function replaceSearchParams(nextParams: TransactionsQueryParams) {
    const nextSearchParams = toTransactionsSearchParams(nextParams)
    const queryString = nextSearchParams.toString()

    router.replace(queryString.length > 0 ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    })
  }

  function updateFilters(nextPartial: TransactionsQueryParams, options?: { resetPage?: boolean }) {
    const nextParams: TransactionsQueryParams = {
      ...activeFilters,
      ...nextPartial,
    }

    if (options?.resetPage ?? true) {
      nextParams.page = DEFAULT_TRANSACTIONS_PAGE
    }

    replaceSearchParams(nextParams)
  }

  function clearFilters() {
    replaceSearchParams({})
  }

  return (
    <div className='space-y-6'>
      <TransactionFilters
        activeFilters={activeFilters}
        wallets={wallets}
        hasActiveFilters={hasActiveFilters}
        onUpdateFilters={updateFilters}
        onClearFilters={clearFilters}
      />

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

      <TransactionsHistoryView
        data={transactionsQuery.data}
        isPending={transactionsQuery.isPending}
        pageSize={activeFilters.pageSize ?? DEFAULT_TRANSACTIONS_PAGE_SIZE}
        onPreviousPage={() => {
          updateFilters({ page: activeFilters.page - 1 }, { resetPage: false })
        }}
        onNextPage={() => {
          updateFilters({ page: activeFilters.page + 1 }, { resetPage: false })
        }}
        onPageSizeChange={(pageSize) => {
          updateFilters({ pageSize }, { resetPage: true })
        }}
        onClearFilters={hasActiveFilters ? clearFilters : undefined}
      />
    </div>
  )
}
