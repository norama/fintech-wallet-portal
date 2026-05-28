'use client'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { CurrencyPill, WalletStatusBadge } from '@/features/overview/components/Badges'
import type {
  WalletsListItem,
  WalletsListResponse,
  WalletsQueryParams,
} from '@/features/wallets/types'
import { formatDateTime, formatMaskedReference, formatMoney } from '@/lib/formatters'

type WalletsViewProps = {
  data?: WalletsListResponse | undefined
  isPending: boolean
  isError: boolean
  errorMessage: string | null
  onClearFilters?: (() => void) | undefined
  activeFilters: WalletsQueryParams
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
          <CurrencyPill currency={wallet.currency} />
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
      </div>

      {/* Desktop layout */}
      <div className='hidden sm:grid sm:grid-cols-[minmax(0,1.5fr)_auto_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto_auto] sm:items-center sm:gap-x-5'>
        <div className='min-w-0'>
          <p className='truncate font-medium text-zinc-950'>{wallet.name}</p>
          <p className='mt-0.5 font-mono text-xs text-zinc-400'>
            {formatMaskedReference(wallet.id)}
          </p>
        </div>
        <CurrencyPill currency={wallet.currency} />
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
        <WalletStatusBadge status={wallet.status} />
        <div>
          <p className='text-xs text-zinc-400'>Created</p>
          <p className='text-sm text-zinc-700'>{formatDateTime(wallet.createdAt)}</p>
        </div>
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
  onClearFilters,
  activeFilters,
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

  const hasActiveFilters =
    Boolean(activeFilters.search) ||
    Boolean(activeFilters.currency) ||
    Boolean(activeFilters.status)

  return (
    <div className='space-y-6'>
      <Card
        tone='wallet'
        eyebrow='Wallet inventory'
        title='Wallets'
        description='All wallets in this account. Balances are shown in their native currency.'
        footer={
          <p className='text-sm text-zinc-500'>
            {data.items.length} {data.items.length === 1 ? 'wallet' : 'wallets'}
            {hasActiveFilters ? ' matching current filters' : ' total'}
          </p>
        }>
        {data.items.length === 0 ? (
          <div className='py-6 text-center'>
            <p className='text-sm font-medium text-zinc-700'>No wallets found</p>
            {hasActiveFilters ? (
              <>
                <p className='mt-1 text-sm text-zinc-500'>No wallets match the current filters.</p>
                <div className='mt-6'>
                  <Button variant='secondary' size='sm' onClick={onClearFilters}>
                    Clear all filters
                  </Button>
                </div>
              </>
            ) : (
              <p className='mt-1 text-sm text-zinc-500'>
                No wallets are associated with this account.
              </p>
            )}
          </div>
        ) : (
          <div className='space-y-3'>
            {data.items.map((wallet) => (
              <WalletRow key={wallet.id} wallet={wallet} />
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
