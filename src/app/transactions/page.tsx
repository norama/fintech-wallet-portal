import { DashboardShell } from '@/features/dashboard/components/DashboardShell'
import { TransactionsPageClient } from '@/features/transactions/components/TransactionsPageClient'
import { requireDemoSessionUserId } from '@/lib/auth/requireDemoSession'

export default async function TransactionsPage() {
  await requireDemoSessionUserId()

  return (
    <main className='flex min-h-screen justify-center bg-[radial-gradient(circle_at_top,#f4f7f5,#edf1ef_42%,#e7ece9_75%)] px-6 py-10 sm:py-14'>
      <DashboardShell
        eyebrow='Wallet operations overview'
        title='Transactions'
        description='Audit-ready transaction history with filterable results, pagination, and expandable detail context.'>
        <TransactionsPageClient />
      </DashboardShell>
    </main>
  )
}
