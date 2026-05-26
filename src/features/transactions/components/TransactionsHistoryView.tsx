'use client'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'
import { TransactionAmount } from '@/components/ui/TransactionAmount'
import {
  CurrencyPill,
  TransactionStatusBadge,
  TransactionTypeBadge,
} from '@/features/dashboard/components/DashboardBadges'
import type { TransactionsListResponse } from '@/features/transactions/types'
import { formatDateTime } from '@/lib/formatters'

type TransactionsHistoryViewProps = {
  data?: TransactionsListResponse | undefined
  isPending: boolean
  page: number
  onPreviousPage: () => void
  onNextPage: () => void
}

function HistoryTableSkeleton() {
  return (
    <div className='space-y-6'>
      <SkeletonCard
        tone='transaction'
        eyebrow='Transaction history'
        title='Loading transactions'
        description='Preparing paginated transaction history for the active filters.'
        lines={[
          { widthClassName: 'w-40' },
          { widthClassName: 'w-full' },
          { widthClassName: 'w-10/12' },
        ]}
      />

      <Card tone='transaction' padding='md'>
        <div className='hidden md:block'>
          <div className='grid grid-cols-[1.1fr_1.3fr_1fr_1fr_1fr_1.2fr_0.9fr] gap-4 border-b border-violet-200 pb-3'>
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={index} className='h-4 w-16' />
            ))}
          </div>
          <div className='space-y-4 pt-4'>
            {Array.from({ length: 6 }).map((_, rowIndex) => (
              <div
                key={rowIndex}
                className='grid grid-cols-[1.1fr_1.3fr_1fr_1fr_1fr_1.2fr_0.9fr] gap-4 rounded-2xl border border-violet-200/60 bg-white/70 px-4 py-4'>
                {['w-24', 'w-32', 'w-24', 'w-24', 'w-20', 'w-28', 'w-24'].map(
                  (widthClassName, cellIndex) => (
                    <Skeleton key={cellIndex} className={`h-4 ${widthClassName}`} />
                  ),
                )}
              </div>
            ))}
          </div>
        </div>

        <div className='space-y-4 md:hidden'>
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className='space-y-3 rounded-2xl border border-violet-200/60 bg-white/70 px-4 py-4'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-5 w-36' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-4/5' />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export function TransactionsHistoryView({
  data,
  isPending,
  page,
  onPreviousPage,
  onNextPage,
}: TransactionsHistoryViewProps) {
  if (isPending) {
    return <HistoryTableSkeleton />
  }

  if (!data) {
    return null
  }

  const hasItems = data.items.length > 0

  return (
    <Card
      tone='transaction'
      eyebrow='Transaction history'
      title='Transactions'
      description='Scoped transaction history with pagination for the currently selected filters.'
      footer={
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <p className='text-sm text-zinc-700'>
            {data.totalCount} {data.totalCount === 1 ? 'transaction' : 'transactions'}
          </p>
          <div className='flex items-center gap-3'>
            <Button variant='secondary' size='sm' disabled={page <= 1} onClick={onPreviousPage}>
              Previous
            </Button>
            <span className='text-sm text-zinc-700'>
              Page {data.page} of {data.pageCount || 1}
            </span>
            <Button
              variant='secondary'
              size='sm'
              disabled={data.pageCount === 0 || page >= data.pageCount}
              onClick={onNextPage}>
              Next
            </Button>
          </div>
        </div>
      }>
      {!hasItems ? (
        <div className='rounded-2xl border border-violet-200 bg-white/70 px-5 py-8 text-center'>
          <p className='text-lg font-semibold tracking-tight text-zinc-950'>
            No transactions match the current filters
          </p>
          <p className='mt-2 text-sm leading-6 text-zinc-600'>
            Adjust the search or filter selections to broaden the results.
          </p>
        </div>
      ) : (
        <>
          <div className='hidden overflow-x-auto md:block'>
            <table className='min-w-full border-separate border-spacing-y-3'>
              <thead>
                <tr className='text-left text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500'>
                  <th className='px-3 py-2'>Date</th>
                  <th className='px-3 py-2'>Counterparty</th>
                  <th className='px-3 py-2'>Type</th>
                  <th className='px-3 py-2'>Wallet</th>
                  <th className='px-3 py-2'>Status</th>
                  <th className='px-3 py-2'>Reference</th>
                  <th className='px-3 py-2 text-right'>Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className='rounded-2xl border border-violet-200/60 bg-white/70 shadow-sm'>
                    <td className='rounded-l-2xl border-y border-l border-violet-200/60 px-3 py-4 align-top text-sm text-zinc-700'>
                      {formatDateTime(transaction.createdAt)}
                    </td>
                    <td className='border-y border-violet-200/60 px-3 py-4 align-top'>
                      <div className='space-y-1'>
                        <p className='font-semibold text-zinc-950'>
                          {transaction.counterpartyName}
                        </p>
                        {transaction.counterpartyRef ? (
                          <p className='text-sm text-zinc-600'>{transaction.counterpartyRef}</p>
                        ) : null}
                      </div>
                    </td>
                    <td className='border-y border-violet-200/60 px-3 py-4 align-top'>
                      <div className='flex flex-wrap gap-2'>
                        <TransactionTypeBadge type={transaction.transactionType} />
                      </div>
                    </td>
                    <td className='border-y border-violet-200/60 px-3 py-4 align-top'>
                      <div className='space-y-1'>
                        <p className='font-medium text-zinc-900'>
                          {transaction.walletName ?? 'Wallet unavailable'}
                        </p>
                        <CurrencyPill currency={transaction.currency} />
                      </div>
                    </td>
                    <td className='border-y border-violet-200/60 px-3 py-4 align-top'>
                      <TransactionStatusBadge status={transaction.status} />
                    </td>
                    <td className='border-y border-violet-200/60 px-3 py-4 align-top text-sm text-zinc-700'>
                      {transaction.reference}
                    </td>
                    <td className='rounded-r-2xl border-y border-r border-violet-200/60 px-3 py-4 align-top text-right'>
                      <TransactionAmount
                        amountMinor={transaction.amountMinor}
                        currency={transaction.currency}
                        direction={transaction.direction}
                        align='right'
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className='space-y-4 md:hidden'>
            {data.items.map((transaction) => (
              <article
                key={transaction.id}
                className='space-y-4 rounded-2xl border border-violet-200/60 bg-white/70 px-4 py-4 shadow-sm'>
                <div className='flex items-start justify-between gap-4'>
                  <div className='space-y-1'>
                    <p className='text-sm text-zinc-500'>{formatDateTime(transaction.createdAt)}</p>
                    <p className='font-semibold text-zinc-950'>{transaction.counterpartyName}</p>
                  </div>
                  <TransactionAmount
                    amountMinor={transaction.amountMinor}
                    currency={transaction.currency}
                    direction={transaction.direction}
                    align='right'
                  />
                </div>

                <div className='flex flex-wrap gap-2'>
                  <TransactionTypeBadge type={transaction.transactionType} />
                  <TransactionStatusBadge status={transaction.status} />
                  <CurrencyPill currency={transaction.currency} />
                </div>

                <dl className='grid gap-3 text-sm sm:grid-cols-2'>
                  <div>
                    <dt className='text-zinc-500'>Wallet</dt>
                    <dd className='mt-1 font-medium text-zinc-900'>
                      {transaction.walletName ?? 'Wallet unavailable'}
                    </dd>
                  </div>
                  <div>
                    <dt className='text-zinc-500'>Reference</dt>
                    <dd className='mt-1 font-medium text-zinc-900'>{transaction.reference}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </>
      )}
    </Card>
  )
}
