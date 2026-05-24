'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DashboardRequestError } from '@/features/dashboard/api/dashboardClient'
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
} from '@/features/dashboard/components/DashboardBadges'
import { formatDateTime, formatMaskedReference, formatMoney } from '@/lib/formatters'
import { getDashboardQueryOptions } from '@/lib/query/dashboardQuery'
import type { CurrencyCode } from '@/lib/supabase/database.types'
import type { DashboardResponse } from '@/lib/types/api'

function buildActivityAlerts(data: DashboardResponse) {
  const alerts: Array<{
    tone: 'info' | 'success' | 'warning' | 'danger'
    title: string
    description: string
  }> = []

  if (!data.account) {
    alerts.push({
      tone: 'warning',
      title: 'Account details unavailable',
      description:
        'The dashboard loaded without an account record. Verify the account relationship for this user.',
    })
  }

  if (data.account?.verificationStatus === 'restricted') {
    alerts.push({
      tone: 'danger',
      title: 'Account restricted',
      description: 'Payments or transfers may be blocked until compliance review is resolved.',
    })
  }

  if (data.transactions.some((transaction) => transaction.status === 'requires_review')) {
    alerts.push({
      tone: 'warning',
      title: 'Transactions need review',
      description: 'At least one recent transaction requires manual review before it can progress.',
    })
  }

  if (data.wallets.length === 0) {
    alerts.push({
      tone: 'info',
      title: 'No wallets yet',
      description:
        'Create or seed a wallet to start seeing balances and transaction activity in this dashboard.',
    })
  }

  if (alerts.length === 0) {
    alerts.push({
      tone: 'success',
      title: 'Operations look healthy',
      description:
        'Balances and recent activity loaded successfully and there are no immediate operational alerts.',
    })
  }

  return alerts.slice(0, 3)
}

function getSignedAmountLabel(
  amountMinor: number,
  currency: CurrencyCode,
  direction: 'incoming' | 'outgoing',
) {
  const sign = direction === 'incoming' ? '+' : '-'
  return `${sign}${formatMoney(amountMinor, currency)}`
}

export function DashboardOverview() {
  const router = useRouter()
  const dashboardQuery = useQuery(getDashboardQueryOptions())

  useEffect(() => {
    if (
      dashboardQuery.error instanceof DashboardRequestError &&
      dashboardQuery.error.status === 401
    ) {
      router.replace('/sign-in')
    }
  }, [dashboardQuery.error, router])

  const dashboardError =
    dashboardQuery.error instanceof DashboardRequestError ? dashboardQuery.error : null
  const isUnauthorized = dashboardError?.status === 401
  const errorMessage = !isUnauthorized && dashboardError ? dashboardError.message : null

  const dashboard = dashboardQuery.data
  const activityAlerts = dashboard ? buildActivityAlerts(dashboard) : []

  return (
    <>
      {dashboardQuery.isPending ? (
        <div className='space-y-6'>
          <section className='flex flex-col gap-6 lg:flex-row lg:flex-wrap'>
            {[
              { tone: 'status' as const, title: 'Loading account status' },
              { tone: 'alert' as const, title: 'Loading alerts' },
              { tone: 'activity' as const, title: 'Loading activity summary' },
            ].map((item) => (
              <Card key={item.title} tone={item.tone} title={item.title} padding='md'>
                <div className='animate-pulse space-y-3'>
                  <div className='h-4 w-24 rounded bg-zinc-200' />
                  <div className='h-7 w-32 rounded bg-zinc-200' />
                  <div className='h-4 w-full rounded bg-zinc-200' />
                </div>
              </Card>
            ))}
          </section>

          <section className='grid gap-6 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3'>
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} tone='wallet' eyebrow='Wallet balance' title='Loading wallet'>
                <div className='animate-pulse space-y-3'>
                  <div className='h-4 w-24 rounded bg-zinc-200' />
                  <div className='h-8 w-40 rounded bg-zinc-200' />
                  <div className='h-4 w-28 rounded bg-zinc-200' />
                </div>
              </Card>
            ))}
          </section>

          <Card tone='transaction' title='Loading recent transactions'>
            <div className='animate-pulse space-y-3'>
              <div className='h-4 w-40 rounded bg-zinc-200' />
              <div className='h-4 w-full rounded bg-zinc-200' />
              <div className='h-4 w-5/6 rounded bg-zinc-200' />
            </div>
          </Card>
        </div>
      ) : null}

      {errorMessage ? (
        <Alert
          tone='danger'
          title='Dashboard unavailable'
          description={errorMessage}
          action={
            <Button variant='secondary' size='sm' onClick={() => void dashboardQuery.refetch()}>
              Retry
            </Button>
          }
        />
      ) : null}

      {dashboard ? (
        <div className='space-y-6'>
          <section className='flex flex-col gap-6 lg:flex-row lg:flex-wrap'>
            <div className='lg:min-w-[18rem] lg:flex-1'>
              <Card
                tone='status'
                title='Account status'
                eyebrow='Compliance'
                description={
                  dashboard.account
                    ? 'Current verification and ownership context for the authenticated account.'
                    : 'No account record was returned for this user.'
                }
                padding='md'>
                {dashboard.account ? (
                  <>
                    <div className='space-y-1'>
                      <p className='text-2xl font-semibold tracking-tight text-zinc-950'>
                        {dashboard.account.displayName}
                      </p>
                      <p className='text-sm text-zinc-600'>
                        Created {formatDateTime(dashboard.account.createdAt)}
                      </p>
                    </div>
                    <div className='flex flex-wrap gap-2'>
                      <AccountVerificationBadge status={dashboard.account.verificationStatus} />
                      <AccountTypeBadge type={dashboard.account.accountType} />
                      <UserRoleBadge role={dashboard.user.role} />
                    </div>
                  </>
                ) : (
                  <Alert
                    tone='warning'
                    title='Account missing'
                    description='Link this user to an account record to unlock the full dashboard experience.'
                  />
                )}
              </Card>
            </div>

            <div className='lg:min-w-[18rem] lg:flex-1'>
              <Card tone='alert' title='Alerts' eyebrow='Operations' padding='md'>
                <div className='space-y-3'>
                  {activityAlerts.map((alert) => (
                    <Alert
                      key={alert.title}
                      tone={alert.tone}
                      title={alert.title}
                      description={alert.description}
                    />
                  ))}
                </div>
              </Card>
            </div>

            <div className='lg:min-w-[18rem] lg:flex-1'>
              <Card
                tone='activity'
                title='Activity summary'
                eyebrow='Quick view'
                description='Simple operational markers based on the currently loaded payload.'
                padding='md'>
                <dl className='space-y-4 text-sm'>
                  <div className='flex items-center justify-between gap-3'>
                    <dt className='text-zinc-500'>Wallet count</dt>
                    <dd className='font-semibold text-zinc-950'>{dashboard.wallets.length}</dd>
                  </div>
                  <div className='flex items-center justify-between gap-3'>
                    <dt className='text-zinc-500'>Recent transactions</dt>
                    <dd className='font-semibold text-zinc-950'>{dashboard.transactions.length}</dd>
                  </div>
                  <div className='flex items-center justify-between gap-3'>
                    <dt className='text-zinc-500'>Pending / review</dt>
                    <dd className='font-semibold text-zinc-950'>
                      {
                        dashboard.transactions.filter(
                          (transaction) =>
                            transaction.status === 'pending' ||
                            transaction.status === 'requires_review',
                        ).length
                      }
                    </dd>
                  </div>
                  <div className='flex items-center justify-between gap-3'>
                    <dt className='text-zinc-500'>Failed / reversed</dt>
                    <dd className='font-semibold text-zinc-950'>
                      {
                        dashboard.transactions.filter(
                          (transaction) =>
                            transaction.status === 'failed' || transaction.status === 'reversed',
                        ).length
                      }
                    </dd>
                  </div>
                </dl>
              </Card>
            </div>
          </section>

          <section className='grid gap-6 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3'>
            {dashboard.wallets.length > 0 ? (
              dashboard.wallets.map((wallet) => (
                <Card
                  key={wallet.id}
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
                      <dd className='mt-1 font-medium text-zinc-900'>
                        {formatMaskedReference(wallet.id)}
                      </dd>
                    </div>
                  </dl>
                </Card>
              ))
            ) : (
              <div className='md:col-span-2 xl:col-span-2 2xl:col-span-3'>
                <Card
                  tone='wallet'
                  eyebrow='Wallet balance'
                  title='No wallet balances to show'
                  description='Once wallets are available for this account, their balances will appear here.'>
                  <Alert
                    tone='info'
                    title='Wallets pending setup'
                    description='Create or seed a wallet for this account to populate balance, reserve, and currency information.'
                  />
                </Card>
              </div>
            )}
          </section>

          <section>
            <Card
              tone='transaction'
              title='Recent transactions'
              eyebrow='Latest activity'
              description='A concise view of the most recent money movement across the available wallets.'>
              {dashboard.transactions.length > 0 ? (
                <div className='space-y-4'>
                  {dashboard.transactions.map((transaction) => (
                    <article
                      key={transaction.id}
                      className='rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4'>
                      <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                        <div className='space-y-2'>
                          <div className='flex flex-wrap items-center gap-2'>
                            <p className='font-semibold text-zinc-950'>
                              {transaction.counterpartyName}
                            </p>
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
                              Reference:{' '}
                              <span className='font-medium text-zinc-900'>
                                {transaction.reference}
                              </span>
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
                          <p
                            className={[
                              'text-2xl font-semibold tracking-tight',
                              transaction.direction === 'incoming'
                                ? 'text-emerald-700'
                                : 'text-zinc-950',
                            ].join(' ')}>
                            {getSignedAmountLabel(
                              transaction.amountMinor,
                              transaction.currency,
                              transaction.direction,
                            )}
                          </p>
                          <p className='mt-1 text-sm text-zinc-600'>
                            {transaction.completedAt
                              ? `Completed ${formatDateTime(transaction.completedAt)}`
                              : 'Awaiting completion'}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <Alert
                  tone='info'
                  title='No recent transactions'
                  description='Recent transaction activity will appear here once transfers or card activity exist for this account.'
                />
              )}
            </Card>
          </section>
        </div>
      ) : null}
    </>
  )
}
