'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { OverviewRequestError } from '@/features/overview/api/overviewClient'
import {
  AccountStatusCard,
  ActivitySummaryCard,
  AlertsCard,
  TransactionItem,
  WalletFundsCard,
} from '@/features/overview/components/OverviewCards'
import { getOverviewQueryOptions } from '@/lib/query/overviewQuery'
import type { CurrencyCode } from '@/lib/supabase/database.types'
import type { OverviewResponse } from '@/lib/types/api'

function buildActivityAlerts(data: OverviewResponse) {
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
        'The overview loaded without an account record. Verify the account relationship for this user.',
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
        'Create or seed a wallet to start seeing balances and transaction activity in this overview.',
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

function aggregateWalletFunds(wallets: OverviewResponse['wallets']) {
  const balance: Partial<Record<CurrencyCode, number>> = {}
  const available: Partial<Record<CurrencyCode, number>> = {}
  const reserved: Partial<Record<CurrencyCode, number>> = {}

  for (const wallet of wallets) {
    balance[wallet.currency] = (balance[wallet.currency] ?? 0) + wallet.balanceMinor
    available[wallet.currency] = (available[wallet.currency] ?? 0) + wallet.availableBalanceMinor
    reserved[wallet.currency] = (reserved[wallet.currency] ?? 0) + wallet.reservedBalanceMinor
  }

  return { balance, available, reserved }
}

export function Overview() {
  const router = useRouter()
  const overviewQuery = useQuery(getOverviewQueryOptions())

  useEffect(() => {
    if (overviewQuery.error instanceof OverviewRequestError && overviewQuery.error.status === 401) {
      router.replace('/sign-in')
    }
  }, [overviewQuery.error, router])

  const overviewError =
    overviewQuery.error instanceof OverviewRequestError ? overviewQuery.error : null
  const isUnauthorized = overviewError?.status === 401
  const errorMessage = !isUnauthorized && overviewError ? overviewError.message : null

  const overview = overviewQuery.data
  const activityAlerts = overview ? buildActivityAlerts(overview) : []

  return (
    <>
      {overviewQuery.isPending ? (
        <div className='space-y-6'>
          <section className='flex flex-col gap-6 lg:flex-row lg:flex-wrap'>
            {[
              { tone: 'status' as const, title: 'Loading account status' },
              { tone: 'alert' as const, title: 'Loading alerts' },
              { tone: 'activity' as const, title: 'Loading activity summary' },
            ].map((item) => (
              <SkeletonCard
                key={item.title}
                tone={item.tone}
                title={item.title}
                padding='md'
                lines={[
                  { widthClassName: 'w-24' },
                  { widthClassName: 'w-32', heightClassName: 'h-7' },
                  { widthClassName: 'w-full' },
                ]}
              />
            ))}
          </section>

          <section className='grid gap-6 sm:grid-cols-3'>
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonCard
                key={index}
                tone='wallet'
                eyebrow='Loading…'
                title='Wallet funds'
                padding='md'
                lines={[{ widthClassName: 'w-20' }, { widthClassName: 'w-28' }]}
              />
            ))}
          </section>

          <SkeletonCard
            tone='transaction'
            title='Loading recent transactions'
            lines={[
              { widthClassName: 'w-40' },
              { widthClassName: 'w-full' },
              { widthClassName: 'w-5/6' },
            ]}
          />
        </div>
      ) : null}

      {errorMessage ? (
        <Alert
          tone='danger'
          title='Dashboard unavailable'
          description={errorMessage}
          action={
            <Button variant='secondary' size='sm' onClick={() => void overviewQuery.refetch()}>
              Retry
            </Button>
          }
        />
      ) : null}

      {overview ? (
        <div className='space-y-6'>
          <section className='flex flex-col gap-6 lg:flex-row lg:flex-wrap'>
            <div className='lg:min-w-[18rem] lg:flex-1 lg:[&>section]:h-full'>
              <AccountStatusCard account={overview.account} user={overview.user} />
            </div>
            <div className='lg:min-w-[18rem] lg:flex-1 lg:[&>section]:h-full'>
              <AlertsCard alerts={activityAlerts} />
            </div>
            <div className='lg:min-w-[18rem] lg:flex-1 lg:[&>section]:h-full'>
              <ActivitySummaryCard
                wallets={overview.wallets}
                transactions={overview.transactions}
              />
            </div>
          </section>

          <section className='grid gap-6 sm:grid-cols-3'>
            {overview.wallets.length > 0 ? (
              (() => {
                const funds = aggregateWalletFunds(overview.wallets)
                return (
                  <>
                    <WalletFundsCard
                      eyebrow='Total balance'
                      title='Balance'
                      byCurrency={funds.balance}
                    />
                    <WalletFundsCard
                      eyebrow='Available funds'
                      title='Available'
                      byCurrency={funds.available}
                    />
                    <WalletFundsCard
                      eyebrow='Reserved funds'
                      title='Reserved'
                      byCurrency={funds.reserved}
                    />
                  </>
                )
              })()
            ) : (
              <div className='sm:col-span-3'>
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
              {overview.transactions.length > 0 ? (
                <div className='space-y-4'>
                  {overview.transactions.map((transaction) => (
                    <TransactionItem key={transaction.id} transaction={transaction} />
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
