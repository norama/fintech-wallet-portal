'use client'

import type { ReactNode } from 'react'
import { Fragment, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'
import { TransactionAmount } from '@/components/ui/TransactionAmount'
import {
  CounterpartyTypeBadge,
  CurrencyPill,
  TransactionDirectionBadge,
  TransactionStatusBadge,
  TransactionTypeBadge,
} from '@/features/overview/components/Badges'
import type { TransactionsListResponse } from '@/features/transactions/types'
import { formatDateTime } from '@/lib/formatters'
import type { CounterpartyType, TransactionStatus } from '@/lib/supabase/database.types'
import type { TransactionsListItem } from '@/lib/types/api'

type TransactionsHistoryViewProps = {
  data?: TransactionsListResponse | undefined
  isPending: boolean
  page: number
  onPreviousPage: () => void
  onNextPage: () => void
  onClearFilters?: (() => void) | undefined
}

function getCounterpartyReferenceLabel(counterpartyType: CounterpartyType) {
  switch (counterpartyType) {
    case 'internal_wallet':
      return 'Counterparty wallet reference'
    case 'external_account':
      return 'External account reference'
    case 'card_merchant':
      return 'Card reference'
    case 'platform':
      return 'Platform reference'
    case 'fx':
      return 'FX pair/reference'
  }
}

function getOperationalNote(status: TransactionStatus) {
  switch (status) {
    case 'pending':
      return 'This transaction is awaiting settlement.'
    case 'requires_review':
      return 'This transaction requires manual review.'
    case 'failed':
      return 'This transaction did not complete successfully.'
    case 'reversed':
      return 'This transaction was reversed after processing.'
    case 'completed':
      return 'This transaction completed successfully.'
  }
}

function TransactionDetailItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className='space-y-1'>
      <dt className='text-xs font-medium uppercase tracking-[0.12em] text-zinc-500'>{label}</dt>
      <dd className='text-sm text-zinc-900'>{children}</dd>
    </div>
  )
}

function TransactionDetailsPanel({ transaction }: { transaction: TransactionsListItem }) {
  return (
    <div className='rounded-3xl border border-violet-200/80 bg-violet-50/70 px-5 py-5'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
        <div>
          <p className='text-xs font-medium uppercase tracking-[0.18em] text-violet-700'>
            Audit context
          </p>
          <p className='mt-2 text-sm leading-6 text-zinc-700'>
            {getOperationalNote(transaction.status)}
          </p>
        </div>
        <div className='shrink-0'>
          <TransactionAmount
            amountMinor={transaction.amountMinor}
            currency={transaction.currency}
            direction={transaction.direction}
            align='right'
          />
        </div>
      </div>

      <dl className='mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
        <TransactionDetailItem label='Transaction ID'>
          <span className='break-all font-mono text-xs text-zinc-700'>{transaction.id}</span>
        </TransactionDetailItem>
        <TransactionDetailItem label='Reference'>
          <span className='font-medium'>{transaction.reference}</span>
        </TransactionDetailItem>
        <TransactionDetailItem label='Wallet name'>
          <span className='font-medium'>{transaction.walletName ?? 'Wallet unavailable'}</span>
        </TransactionDetailItem>
        <TransactionDetailItem label='Direction'>
          <TransactionDirectionBadge direction={transaction.direction} />
        </TransactionDetailItem>
        <TransactionDetailItem label='Transaction type'>
          <TransactionTypeBadge type={transaction.transactionType} />
        </TransactionDetailItem>
        <TransactionDetailItem label='Status'>
          <TransactionStatusBadge status={transaction.status} />
        </TransactionDetailItem>
        <TransactionDetailItem label='Counterparty type'>
          <CounterpartyTypeBadge type={transaction.counterpartyType} />
        </TransactionDetailItem>
        <TransactionDetailItem label='Counterparty name'>
          <span className='font-medium'>{transaction.counterpartyName}</span>
        </TransactionDetailItem>
        <TransactionDetailItem label={getCounterpartyReferenceLabel(transaction.counterpartyType)}>
          <span className='break-all text-zinc-700'>
            {transaction.counterpartyRef ?? 'Unavailable'}
          </span>
        </TransactionDetailItem>
        <TransactionDetailItem label='Created at'>
          <span>{formatDateTime(transaction.createdAt)}</span>
        </TransactionDetailItem>
        <TransactionDetailItem label='Completed at'>
          <span>
            {transaction.completedAt
              ? formatDateTime(transaction.completedAt)
              : 'Awaiting completion'}
          </span>
        </TransactionDetailItem>
        <TransactionDetailItem label='Currency'>
          <CurrencyPill currency={transaction.currency} />
        </TransactionDetailItem>
      </dl>
      {transaction.paymentNote !== null ? (
        <dl className='mt-4'>
          <TransactionDetailItem label='Payment note'>
            <span className='leading-6'>{transaction.paymentNote}</span>
          </TransactionDetailItem>
        </dl>
      ) : null}
    </div>
  )
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
  onClearFilters,
}: TransactionsHistoryViewProps) {
  const [expandedTransactionIdState, setExpandedTransactionId] = useState<string | null>(null)

  if (isPending) {
    return <HistoryTableSkeleton />
  }

  if (!data) {
    return null
  }

  const hasItems = data.items.length > 0
  const expandedTransactionId = data.items.some((item) => item.id === expandedTransactionIdState)
    ? expandedTransactionIdState
    : null

  return (
    <Card
      tone='transaction'
      eyebrow='Transaction history'
      title='Transactions'
      description='Scoped transaction history with pagination. Click a row to inspect operational and audit details.'
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
        <div className='rounded-2xl border border-violet-200 bg-white/70 px-5 py-10 text-center'>
          <p className='text-lg font-semibold tracking-tight text-zinc-950'>
            {onClearFilters
              ? 'No transactions match the current filters'
              : 'No transaction history yet'}
          </p>
          <p className='mt-2 text-sm leading-6 text-zinc-600'>
            {onClearFilters
              ? 'Adjust the search or filter criteria to widen the result set.'
              : 'Transactions will appear here once activity is recorded against wallets for this account.'}
          </p>
          {onClearFilters ? (
            <div className='mt-6'>
              <Button variant='secondary' size='sm' onClick={onClearFilters}>
                Clear all filters
              </Button>
            </div>
          ) : null}
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
                {data.items.map((transaction) => {
                  const isExpanded = expandedTransactionId === transaction.id
                  const detailPanelId = `transaction-detail-${transaction.id}`

                  return (
                    <Fragment key={transaction.id}>
                      <tr
                        className={[
                          'cursor-pointer rounded-2xl border border-violet-200/60 shadow-sm transition focus-within:bg-violet-50/60 hover:bg-violet-50/60',
                          isExpanded ? 'bg-violet-50/60' : 'bg-white/70',
                        ].join(' ')}
                        onClick={() => {
                          setExpandedTransactionId(isExpanded ? null : transaction.id)
                        }}
                        onKeyDown={(event) => {
                          if (event.key !== 'Enter' && event.key !== ' ') {
                            return
                          }

                          event.preventDefault()
                          setExpandedTransactionId(isExpanded ? null : transaction.id)
                        }}
                        aria-expanded={isExpanded}
                        aria-controls={detailPanelId}
                        tabIndex={0}>
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
                            ) : (
                              <p className='text-sm text-zinc-500'>No counterparty reference</p>
                            )}
                            {transaction.paymentNote !== null ? (
                              <p className='text-xs text-zinc-400'>{transaction.paymentNote}</p>
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
                          <div className='space-y-1'>
                            <p>{transaction.reference}</p>
                            <p className='text-xs font-medium uppercase tracking-[0.12em] text-zinc-500'>
                              {isExpanded ? 'Hide details' : 'View details'}
                            </p>
                          </div>
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

                      {isExpanded ? (
                        <tr>
                          <td className='px-3 pt-0' colSpan={7}>
                            <div id={detailPanelId}>
                              <TransactionDetailsPanel transaction={transaction} />
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className='space-y-4 md:hidden'>
            {data.items.map((transaction) => {
              const isExpanded = expandedTransactionId === transaction.id

              return (
                <article
                  key={transaction.id}
                  className={[
                    'space-y-4 rounded-2xl border border-violet-200/60 px-4 py-4 shadow-sm transition',
                    isExpanded ? 'bg-violet-50/60' : 'bg-white/70',
                  ].join(' ')}>
                  <button
                    type='button'
                    className='flex w-full items-start justify-between gap-4 text-left'
                    onClick={() => {
                      setExpandedTransactionId(isExpanded ? null : transaction.id)
                    }}
                    aria-expanded={isExpanded}>
                    <div className='space-y-1'>
                      <p className='text-sm text-zinc-500'>
                        {formatDateTime(transaction.createdAt)}
                      </p>
                      <p className='font-semibold text-zinc-950'>{transaction.counterpartyName}</p>
                      <p className='text-xs font-medium uppercase tracking-[0.12em] text-zinc-500'>
                        {isExpanded ? 'Hide details' : 'View details'}
                      </p>
                    </div>
                    <TransactionAmount
                      amountMinor={transaction.amountMinor}
                      currency={transaction.currency}
                      direction={transaction.direction}
                      align='right'
                    />
                  </button>

                  <div className='flex flex-wrap gap-2'>
                    <TransactionTypeBadge type={transaction.transactionType} />
                    <TransactionStatusBadge status={transaction.status} />
                    <CurrencyPill currency={transaction.currency} />
                    <TransactionDirectionBadge direction={transaction.direction} />
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

                  {isExpanded ? <TransactionDetailsPanel transaction={transaction} /> : null}
                </article>
              )
            })}
          </div>
        </>
      )}
    </Card>
  )
}
