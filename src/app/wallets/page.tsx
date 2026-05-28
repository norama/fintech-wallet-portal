import { Shell } from '@/features/overview/components/Shell'
import { Wallets } from '@/features/wallets/components/Wallets'
import { requireDemoSessionUserId } from '@/lib/auth/requireDemoSession'

export default async function WalletsPage() {
  await requireDemoSessionUserId()

  return (
    <main className='flex min-h-screen justify-center bg-[radial-gradient(circle_at_top,#f4f7f5,#edf1ef_42%,#e7ece9_75%)] px-6 py-10 sm:py-14'>
      <Shell
        eyebrow='Wallet operations overview'
        title='Wallets'
        description='Manage wallet balances, currencies, and activity. Filter and inspect all wallets associated with this account.'>
        <Wallets />
      </Shell>
    </main>
  )
}
