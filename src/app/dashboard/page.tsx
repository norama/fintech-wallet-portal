import { Overview } from '@/features/overview/components/Overview'
import { Shell } from '@/features/overview/components/Shell'
import { requireDemoSessionUserId } from '@/lib/auth/requireDemoSession'

export default async function DashboardPage() {
  await requireDemoSessionUserId()

  return (
    <main className='flex min-h-screen justify-center bg-[radial-gradient(circle_at_top,#f4f7f5,#edf1ef_42%,#e7ece9_75%)] px-6 py-10 sm:py-14'>
      <Shell
        eyebrow='Wallet operations overview'
        title='Overview'
        description='Track balances, recent activity, account status, and operational alerts from a single overview route.'>
        <Overview />
      </Shell>
    </main>
  )
}
