import { Shell } from '@/features/overview/components/Shell'
import { NewWallet } from '@/features/wallets/components/NewWallet'
import { requireDemoSessionUserId } from '@/lib/auth/requireDemoSession'

export default async function NewWalletPage() {
  await requireDemoSessionUserId()

  return (
    <main className='flex min-h-screen justify-center bg-[radial-gradient(circle_at_top,#f4f7f5,#edf1ef_42%,#e7ece9_75%)] px-6 py-10 sm:py-14'>
      <Shell
        eyebrow='Wallet operations overview'
        title='New wallet'
        description='Create a zero-balance wallet for a selected currency. The wallet becomes active immediately.'>
        <NewWallet />
      </Shell>
    </main>
  )
}
