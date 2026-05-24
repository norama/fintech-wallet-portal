import { DashboardShell } from '@/features/dashboard/components/DashboardShell'
import { FeaturePlaceholder } from '@/features/dashboard/components/FeaturePlaceholder'
import { requireDemoSessionUserId } from '@/lib/auth/requireDemoSession'

export default async function TransactionsPage() {
  await requireDemoSessionUserId()

  return (
    <main className='flex min-h-screen justify-center bg-[radial-gradient(circle_at_top,#f4f7f5,#edf1ef_42%,#e7ece9_75%)] px-6 py-10 sm:py-14'>
      <DashboardShell
        eyebrow='Authenticated Dashboard'
        title='Transactions'
        description='This route will become the dedicated transaction workspace with richer filtering and operational actions.'>
        <FeaturePlaceholder
          eyebrow='Transaction operations'
          title='Transaction center coming next'
          description='The current dashboard already surfaces recent transactions. This page is reserved for the fuller transaction list and review workflows.'
          nextStep='Add server-side filtering, grouping, and pagination for transaction history once the next slice is defined.'
        />
      </DashboardShell>
    </main>
  )
}
