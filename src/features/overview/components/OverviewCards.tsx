import type { ReactNode } from 'react'

import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui/Card'
import { TransactionAmount } from '@/components/ui/TransactionAmount'
import {
  AccountTypeBadge,
  AccountVerificationBadge,
  CounterpartyTypeBadge,
  CurrencyPill,
  TransactionDirectionBadge,
  TransactionStatusBadge,
  TransactionTypeBadge,
  UserRoleBadge,
  WalletStatusBadge,
} from '@/features/overview/components/Badges'
import { formatDateTime, formatMaskedReference, formatMoney } from '@/lib/formatters'
import type { OverviewResponse } from '@/lib/types/api'

type AlertItem = {
  tone: 'info' | 'success' | 'warning' | 'danger'
  title: string
  description: string
}

function SummaryRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className='flex items-center justify-between gap-3'>
      <dt className='text-zinc-500'>{label}</dt>
      <dd className='font-semibold text-zinc-950'>{value}</dd>
    </div>
  )
}

export function AccountStatusCard({
  account,
  user,
}: {
  account: OverviewResponse['account']
  user: OverviewResponse['user']
}) {
  return (
    <Card
      tone='status'
      title='Account status'
      eyebrow='Compliance'
      description={
        account
          ? 'Current verification and ownership context for the authenticated account.'
          : 'No account record was returned for this user.'
      }
      padding='md'>
      {account ? (
        <>
          <div className='space-y-1'>
            <p className='text-2xl font-semibold tracking-tight text-zinc-950'>
              {account.displayName}
            </p>
            <p className='text-sm text-zinc-600'>Created {formatDateTime(account.createdAt)}</p>
          </div>
          <div className='flex flex-wrap gap-2'>
            <AccountVerificationBadge status={account.verificationStatus} />
            <AccountTypeBadge type={account.accountType} />
            <UserRoleBadge role={user.role} />
          </div>
        </>
      ) : (
        <Alert
          tone='warning'
          title='Account missing'
          description='Link this user to an account record to unlock the full overview experience.'
        />
      )}
    </Card>
  )
}

export function AlertsCard({ alerts }: { alerts: AlertItem[] }) {
  return (
    <Card tone='alert' title='Alerts' eyebrow='Operations' padding='md'>
      <div className='space-y-3'>
        {alerts.map((alert) => (
          <Alert
            key={alert.title}
            tone={alert.tone}
            title={alert.title}
            description={alert.description}
          />
        ))}
      </div>
    </Card>
  )
}

export function ActivitySummaryCard({
  wallets,
  transactions,
}: {
  wallets: OverviewResponse['wallets']
  transactions: OverviewResponse['transactions']
}) {
  return (
    <Card
      tone='activity'
      title='Activity summary'
      eyebrow='Quick view'
      description='Simple operational markers based on the currently loaded payload.'
      padding='md'>
      <dl className='space-y-4 text-sm'>
        <SummaryRow label='Wallet count' value={wallets.length} />
        <SummaryRow label='Recent transactions' value={transactions.length} />
        <SummaryRow
          label='Pending / review'
          value={
            transactions.filter((t) => t.status === 'pending' || t.status === 'requires_review')
              .length
          }
        />
        <SummaryRow
          label='Failed / reversed'
          value={
            transactions.filter((t) => t.status === 'failed' || t.status === 'reversed').length
          }
        />
      </dl>
    </Card>
  )
}

export function WalletCard({ wallet }: { wallet: OverviewResponse['wallets'][number] }) {
  return (
    <Card
      tone='wallet'
      eyebrow='Wallet balance'
      title={wallet.name}
      description={`Updated ${formatDateTime(wallet.createdAt)}`}>
      <div className='flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between'>
        <div className='min-w-0'>
          <p className='text-2xl font-semibold tracking-tight text-zinc-950 2xl:text-3xl'>
            {formatMoney(wallet.balanceMinor, wallet.currency)}
          </p>
          <p className='mt-1 text-sm text-zinc-600'>
            Available {formatMoney(wallet.availableBalanceMinor, wallet.currency)}
          </p>
        </div>
        <div className='xl:shrink-0'>
          <CurrencyPill currency={wallet.currency} />
        </div>
      </div>
      <div className='flex flex-wrap gap-2'>
        <WalletStatusBadge status={wallet.status} />
      </div>
      <dl className='grid gap-3 text-sm sm:grid-cols-2'>
        <div className='min-w-0'>
          <dt className='text-zinc-500'>Reserved</dt>
          <dd className='mt-1 font-medium text-zinc-900'>
            {formatMoney(wallet.reservedBalanceMinor, wallet.currency)}
          </dd>
        </div>
        <div className='min-w-0'>
          <dt className='text-zinc-500'>Wallet reference</dt>
          <dd className='mt-1 font-medium text-zinc-900'>{formatMaskedReference(wallet.id)}</dd>
        </div>
      </dl>
    </Card>
  )
}

export function TransactionItem({
  transaction,
}: {
  transaction: OverviewResponse['transactions'][number]
}) {
  return (
    <article className='rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
        <div className='space-y-2'>
          <div className='flex flex-wrap items-center gap-2'>
            <p className='font-semibold text-zinc-950'>{transaction.counterpartyName}</p>
            <TransactionDirectionBadge direction={transaction.direction} />
            <TransactionStatusBadge status={transaction.status} />
          </div>
          <div className='flex flex-wrap gap-2'>
            <TransactionTypeBadge type={transaction.transactionType} />
            <CounterpartyTypeBadge type={transaction.counterpartyType} />
            <CurrencyPill currency={transaction.currency} />
          </div>
          <div className='space-y-1 text-sm text-zinc-600'>
            <p>
              Reference: <span className='font-medium text-zinc-900'>{transaction.reference}</span>
            </p>
            <p>Created: {formatDateTime(transaction.createdAt)}</p>
            {transaction.counterpartyRef ? (
              <p>
                Counterparty reference:{' '}
                <span className='font-medium text-zinc-900'>
                  {formatMaskedReference(transaction.counterpartyRef)}
                </span>
              </p>
            ) : null}
          </div>
        </div>
        <div className='text-left lg:text-right'>
          <TransactionAmount
            amountMinor={transaction.amountMinor}
            currency={transaction.currency}
            direction={transaction.direction}
            size='large'
            align='right'
          />
          <p className='mt-1 text-sm text-zinc-600'>
            {transaction.completedAt
              ? `Completed ${formatDateTime(transaction.completedAt)}`
              : 'Awaiting completion'}
          </p>
        </div>
      </div>
    </article>
  )
}
