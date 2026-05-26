'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { TransactionsRequestError } from '@/features/transactions/api/transactionsClient'
import { TransactionsHistoryView } from '@/features/transactions/components/TransactionsHistoryView'
import { useTransactions } from '@/features/transactions/hooks/useTransactions'
import {
  DEFAULT_TRANSACTIONS_PAGE,
  parseTransactionsSearchParams,
  toTransactionsSearchParams,
  TRANSACTION_DIRECTION_OPTIONS,
  TRANSACTION_STATUS_OPTIONS,
  TRANSACTION_TYPE_OPTIONS,
  type TransactionsQueryParams,
} from '@/features/transactions/types'

const selectClasses =
  'h-11 w-full rounded-2xl border border-zinc-300 bg-white px-4 text-sm text-zinc-950 outline-none transition focus:border-zinc-950'

const pageSizeOptions = [10, 20, 50] as const

function toLabel(value: string) {
  return value
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

function parseStatusValue(value: string): TransactionsQueryParams['status'] {
  return TRANSACTION_STATUS_OPTIONS.find((status) => status === value)
}

function parseDirectionValue(value: string): TransactionsQueryParams['direction'] {
  return TRANSACTION_DIRECTION_OPTIONS.find((direction) => direction === value)
}

function parseTransactionTypeValue(value: string): TransactionsQueryParams['transactionType'] {
  return TRANSACTION_TYPE_OPTIONS.find((transactionType) => transactionType === value)
}

export function TransactionsPageClient() {
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

  function replaceSearchParams(nextParams: TransactionsQueryParams) {
    const nextSearchParams = toTransactionsSearchParams(nextParams)
    const queryString = nextSearchParams.toString()

    router.replace(queryString.length > 0 ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    })
  }

  function updateFilters(
    nextPartial: TransactionsQueryParams,
    options?: {
      resetPage?: boolean
    },
  ) {
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
      <Card
        tone='transaction'
        eyebrow='Transactions filters'
        title='Filter toolbar'
        description='These controls sync with the URL and refetch the transactions endpoint through TanStack Query.'>
        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
          <div className='space-y-2 xl:col-span-3'>
            <label htmlFor='transactions-search' className='text-sm font-medium text-zinc-800'>
              Search
            </label>
            <Input
              id='transactions-search'
              value={activeFilters.search ?? ''}
              onChange={(event) => {
                updateFilters({ search: event.target.value || undefined }, { resetPage: true })
              }}
              placeholder='Search counterparty or reference'
            />
          </div>

          <div className='space-y-2'>
            <label htmlFor='transactions-wallet' className='text-sm font-medium text-zinc-800'>
              Wallet
            </label>
            <select
              id='transactions-wallet'
              className={selectClasses}
              value={activeFilters.walletId ?? ''}
              onChange={(event) => {
                updateFilters({ walletId: event.target.value || undefined }, { resetPage: true })
              }}>
              <option value=''>All wallets</option>
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name} ({wallet.currency})
                </option>
              ))}
            </select>
          </div>

          <div className='space-y-2'>
            <label htmlFor='transactions-status' className='text-sm font-medium text-zinc-800'>
              Status
            </label>
            <select
              id='transactions-status'
              className={selectClasses}
              value={activeFilters.status ?? ''}
              onChange={(event) => {
                updateFilters({ status: parseStatusValue(event.target.value) }, { resetPage: true })
              }}>
              <option value=''>All statuses</option>
              {TRANSACTION_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {toLabel(status)}
                </option>
              ))}
            </select>
          </div>

          <div className='space-y-2'>
            <label htmlFor='transactions-direction' className='text-sm font-medium text-zinc-800'>
              Direction
            </label>
            <select
              id='transactions-direction'
              className={selectClasses}
              value={activeFilters.direction ?? ''}
              onChange={(event) => {
                updateFilters(
                  { direction: parseDirectionValue(event.target.value) },
                  { resetPage: true },
                )
              }}>
              <option value=''>All directions</option>
              {TRANSACTION_DIRECTION_OPTIONS.map((direction) => (
                <option key={direction} value={direction}>
                  {toLabel(direction)}
                </option>
              ))}
            </select>
          </div>

          <div className='space-y-2'>
            <label htmlFor='transactions-type' className='text-sm font-medium text-zinc-800'>
              Transaction type
            </label>
            <select
              id='transactions-type'
              className={selectClasses}
              value={activeFilters.transactionType ?? ''}
              onChange={(event) => {
                updateFilters(
                  { transactionType: parseTransactionTypeValue(event.target.value) },
                  { resetPage: true },
                )
              }}>
              <option value=''>All transaction types</option>
              {TRANSACTION_TYPE_OPTIONS.map((transactionType) => (
                <option key={transactionType} value={transactionType}>
                  {toLabel(transactionType)}
                </option>
              ))}
            </select>
          </div>

          <div className='space-y-2'>
            <label htmlFor='transactions-page-size' className='text-sm font-medium text-zinc-800'>
              Page size
            </label>
            <select
              id='transactions-page-size'
              className={selectClasses}
              value={String(activeFilters.pageSize)}
              onChange={(event) => {
                updateFilters({ pageSize: Number(event.target.value) }, { resetPage: false })
              }}>
              {pageSizeOptions.map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize} per page
                </option>
              ))}
            </select>
          </div>

          <div className='flex items-end'>
            <Button type='button' variant='secondary' onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        </div>
      </Card>

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
        page={activeFilters.page}
        onPreviousPage={() => {
          updateFilters({ page: activeFilters.page - 1 }, { resetPage: false })
        }}
        onNextPage={() => {
          updateFilters({ page: activeFilters.page + 1 }, { resetPage: false })
        }}
      />
    </div>
  )
}
