import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui/Card'
import { CurrencyCode } from '@/lib/supabase/database.types'
import { OverviewResponse } from '@/lib/types/api'
import {
  AccountStatusCard,
  ActivitySummaryCard,
  AlertsCard,
  TransactionItem,
  WalletFundsCard,
} from './OverviewCards'

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

type OverviewContentProps = {
  overview: OverviewResponse
}

export function OverviewContent({ overview }: OverviewContentProps) {
  const activityAlerts = buildActivityAlerts(overview)

  return (
    <div className='space-y-6'>
      <section className='flex flex-col gap-6 lg:flex-row lg:flex-wrap'>
        <div className='lg:min-w-[18rem] lg:flex-1 lg:[&>section]:h-full'>
          <AccountStatusCard account={overview.account} user={overview.user} />
        </div>

        <div className='lg:min-w-[18rem] lg:flex-1 lg:[&>section]:h-full'>
          <AlertsCard alerts={activityAlerts} />
        </div>

        <div className='lg:min-w-[18rem] lg:flex-1 lg:[&>section]:h-full'>
          <ActivitySummaryCard wallets={overview.wallets} transactions={overview.transactions} />
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
  )
}
