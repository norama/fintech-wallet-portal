'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { ListFooter } from '@/components/ui/ListFooter'
import { Skeleton } from '@/components/ui/Skeleton'
import { CurrencyPill, WalletStatusBadge } from '@/features/overview/components/Badges'
import type { WalletsListItem, WalletsListResponse } from '@/features/wallets/types'
import { formatDateTime, formatMaskedReference, formatMoney } from '@/lib/formatters'

type WalletsViewProps = {
  data?: WalletsListResponse | undefined
  isPending: boolean
  isError: boolean
  errorMessage: string | null
  hasActiveFilters: boolean
  onClearFilters?: (() => void) | undefined
  onPage: (page: number) => void
  onPageSize: (pageSize: number) => void
}

function WalletRow({ wallet }: { wallet: WalletsListItem }) {
  return (
    <div className='rounded-2xl border border-sky-200/60 bg-white/70 px-5 py-4'>
      {/* Mobile layout */}
      <div className='sm:hidden'>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0'>
            <p className='truncate font-medium text-zinc-950'>{wallet.name}</p>
            <p className='mt-0.5 font-mono text-xs text-zinc-400'>
              {formatMaskedReference(wallet.id)}
            </p>
          </div>
          <WalletStatusBadge status={wallet.status} />
        </div>
        <div className='mt-2'>
          <CurrencyPill currency={wallet.currency} isPrimary={wallet.isPrimary} />
        </div>
        <div className='mt-3 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-sky-100 pt-3'>
          <div>
            <p className='text-xs text-zinc-400'>Balance</p>
            <p className='text-sm font-semibold text-zinc-950'>
              {formatMoney(wallet.balanceMinor, wallet.currency)}
            </p>
          </div>
          <div>
            <p className='text-xs text-zinc-400'>Available</p>
            <p className='text-sm font-semibold text-emerald-700'>
              {formatMoney(wallet.availableBalanceMinor, wallet.currency)}
            </p>
          </div>
          <div>
            <p className='text-xs text-zinc-400'>Reserved</p>
            <p className='text-sm font-semibold text-zinc-700'>
              {formatMoney(wallet.reservedBalanceMinor, wallet.currency)}
            </p>
          </div>
        </div>
        <div className='mt-3 border-t border-sky-100 pt-3'>
          <Link
            href={`/transactions?walletId=${wallet.id}`}
            className='text-sm font-medium text-sky-700 transition hover:text-sky-900'>
            View transactions
          </Link>
        </div>
      </div>

      {/* Desktop layout */}
      <div className='hidden sm:grid sm:grid-cols-[minmax(0,4fr)_minmax(0,2fr)_minmax(0,3fr)_minmax(0,3fr)_minmax(0,3fr)_minmax(0,2fr)_minmax(0,3fr)_minmax(0,3fr)] sm:items-center sm:gap-x-5'>
        <div className='min-w-0'>
          <p className='truncate font-medium text-zinc-950'>{wallet.name}</p>
          <p className='mt-0.5 font-mono text-xs text-zinc-400'>
            {formatMaskedReference(wallet.id)}
          </p>
        </div>
        <div>
          <CurrencyPill currency={wallet.currency} isPrimary={wallet.isPrimary} />
        </div>
        <p className='text-sm font-semibold text-zinc-950'>
          {formatMoney(wallet.balanceMinor, wallet.currency)}
        </p>
        <p className='text-sm font-semibold text-emerald-700'>
          {formatMoney(wallet.availableBalanceMinor, wallet.currency)}
        </p>
        <p className='text-sm font-semibold text-zinc-700'>
          {formatMoney(wallet.reservedBalanceMinor, wallet.currency)}
        </p>
        <div>
          <WalletStatusBadge status={wallet.status} />
        </div>
        <p className='text-sm text-zinc-700'>{formatDateTime(wallet.createdAt)}</p>
        <Link
          href={`/transactions?walletId=${wallet.id}`}
          className='text-sm font-medium text-sky-700 transition hover:text-sky-900'>
          View transactions
        </Link>
      </div>
    </div>
  )
}

function WalletsListSkeleton() {
  return (
    <div className='space-y-6'>
      <Card tone='wallet' padding='md'>
        <div className='space-y-3'>
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className='flex items-center gap-4 rounded-2xl border border-sky-200/60 bg-white/70 px-5 py-4'>
              <Skeleton className='h-5 w-36' />
              <Skeleton className='h-4 w-16' />
              <Skeleton className='ml-auto h-4 w-24' />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export function WalletsView({
  data,
  isPending,
  isError,
  errorMessage,
  hasActiveFilters,
  onClearFilters,
  onPage,
  onPageSize,
}: WalletsViewProps) {
  if (isPending) {
    return <WalletsListSkeleton />
  }

  if (isError) {
    return (
      <Card tone='wallet' padding='lg' eyebrow='Error' title='Unable to load wallets'>
        <p className='text-sm text-zinc-600'>
          {errorMessage ?? 'An unexpected error occurred. Please try again.'}
        </p>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className='space-y-6'>
      <Card
        tone='wallet'
        footer={
          data.totalCount > 0 ? (
            <ListFooter
              totalCount={data.totalCount}
              singularLabel='wallet'
              qualifier={hasActiveFilters ? 'matching current filters' : undefined}
              page={data.page}
              pageCount={data.pageCount}
              pageSize={data.pageSize}
              onPreviousPage={() => onPage(data.page - 1)}
              onNextPage={() => onPage(data.page + 1)}
              onPageSizeChange={onPageSize}
            />
          ) : undefined
        }>
        {data.items.length === 0 ? (
          hasActiveFilters ? (
            <div className='py-6 text-center'>
              <p className='text-sm font-medium text-zinc-700'>No wallets found</p>
              <p className='mt-1 text-sm text-zinc-500'>No wallets match the current filters.</p>
              <div className='mt-6'>
                <Button variant='secondary' size='sm' onClick={onClearFilters}>
                  Clear all filters
                </Button>
              </div>
            </div>
          ) : (
            <EmptyState
              title='No wallets found'
              description='No wallets are associated with this account.'
              href='/wallets/new'
              buttonLabel='New wallet'
            />
          )
        ) : (
          <div>
            <div className='hidden sm:grid sm:grid-cols-[minmax(0,4fr)_minmax(0,2fr)_minmax(0,3fr)_minmax(0,3fr)_minmax(0,3fr)_minmax(0,2fr)_minmax(0,3fr)_minmax(0,3fr)] sm:items-center sm:gap-x-5 mb-1 px-5 pb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400'>
              <span>Name</span>
              <span>Currency</span>
              <span>Balance</span>
              <span>Available</span>
              <span>Reserved</span>
              <span>Status</span>
              <span>Created</span>
              <span />
            </div>
            <div className='space-y-3'>
              {data.items.map((wallet) => (
                <WalletRow key={wallet.id} wallet={wallet} />
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
