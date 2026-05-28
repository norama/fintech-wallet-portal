'use client'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'
import { CurrencyPill, WalletStatusBadge } from '@/features/overview/components/Badges'
import type {
  WalletsListItem,
  WalletsListResponse,
  WalletsQueryParams,
  WalletsSummary,
} from '@/features/wallets/types'
import { formatDateTime, formatMaskedReference, formatMoney } from '@/lib/formatters'
import type { CurrencyCode } from '@/lib/supabase/database.types'

type WalletsViewProps = {
  data?: WalletsListResponse | undefined
  isPending: boolean
  isError: boolean
  errorMessage: string | null
  onClearFilters?: (() => void) | undefined
  activeFilters: WalletsQueryParams
}

function SummaryItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='flex items-center justify-between gap-3'>
      <dt className='text-sm text-zinc-500'>{label}</dt>
      <dd className='text-sm font-semibold text-zinc-950'>{value}</dd>
    </div>
  )
}

function WalletSummaryCards({ summary }: { summary: WalletsSummary }) {
  const reservedEntries = Object.entries(summary.totalReservedByCurrency) as [
    CurrencyCode,
    number,
  ][]

  return (
    <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
      <Card tone='wallet' padding='md' eyebrow='All wallets' title={String(summary.totalWallets)}>
        <dl className='space-y-2'>
          <SummaryItem label='Active' value={summary.activeWallets} />
          <SummaryItem label='Limited' value={summary.limitedWallets} />
          <SummaryItem label='Suspended' value={summary.suspendedWallets} />
        </dl>
      </Card>

      <Card
        tone='wallet'
        padding='md'
        eyebrow='Active wallets'
        title={String(summary.activeWallets)}>
        <dl className='space-y-2'>
          <SummaryItem
            label='Operational'
            value={`${Math.round((summary.activeWallets / Math.max(summary.totalWallets, 1)) * 100)}%`}
          />
          <SummaryItem label='Limited' value={summary.limitedWallets} />
          <SummaryItem label='Suspended' value={summary.suspendedWallets} />
        </dl>
      </Card>

      <Card
        tone='wallet'
        padding='md'
        eyebrow='Currencies'
        title={String(summary.currencies.length)}>
        <div className='flex flex-wrap gap-2'>
          {summary.currencies.length > 0 ? (
            summary.currencies.map((currency) => (
              <CurrencyPill key={currency} currency={currency} />
            ))
          ) : (
            <p className='text-sm text-zinc-400'>No currencies</p>
          )}
        </div>
      </Card>

      <Card tone='wallet' padding='md' eyebrow='Reserved funds'>
        {reservedEntries.length > 0 ? (
          <dl className='space-y-2'>
            {reservedEntries.map(([currency, amount]) => (
              <SummaryItem key={currency} label={currency} value={formatMoney(amount, currency)} />
            ))}
          </dl>
        ) : (
          <p className='text-sm text-zinc-400'>No reserved funds</p>
        )}
      </Card>
    </div>
  )
}

function WalletRow({ wallet }: { wallet: WalletsListItem }) {
  return (
    <div className='grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 rounded-2xl border border-sky-200/60 bg-white/70 px-5 py-4 sm:grid-cols-[1.5fr_1fr_1fr_1fr_auto_auto] sm:items-center sm:gap-4'>
      <div className='min-w-0 sm:col-span-1'>
        <p className='truncate font-medium text-zinc-950'>{wallet.name}</p>
        <p className='mt-0.5 font-mono text-xs text-zinc-400'>{formatMaskedReference(wallet.id)}</p>
      </div>

      <div className='flex items-start justify-end gap-2 sm:contents'>
        <div className='hidden sm:block'>
          <CurrencyPill currency={wallet.currency} />
        </div>
        <WalletStatusBadge status={wallet.status} />
      </div>

      <div className='sm:hidden'>
        <CurrencyPill currency={wallet.currency} />
      </div>

      <div className='col-span-2 grid grid-cols-3 gap-3 border-t border-sky-100 pt-3 sm:col-span-1 sm:border-0 sm:pt-0'>
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

      <div className='hidden sm:block'>
        <p className='text-xs text-zinc-400'>Created</p>
        <p className='text-sm text-zinc-700'>{formatDateTime(wallet.createdAt)}</p>
      </div>
    </div>
  )
}

function WalletsListSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonCard
            key={index}
            tone='wallet'
            padding='md'
            eyebrow='Loading…'
            lines={[
              { widthClassName: 'w-16', heightClassName: 'h-7' },
              { widthClassName: 'w-full' },
              { widthClassName: 'w-3/4' },
            ]}
          />
        ))}
      </div>

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
      <WalletSummaryCards summary={data.summary} />

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
