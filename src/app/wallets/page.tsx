import { Shell } from '@/features/overview/components/Shell'
import { FeaturePlaceholder } from '@/features/overview/components/FeaturePlaceholder'
import { requireDemoSessionUserId } from '@/lib/auth/requireDemoSession'

export default async function WalletsPage() {
  await requireDemoSessionUserId()

  return (
    <main className='flex min-h-screen justify-center bg-[radial-gradient(circle_at_top,#f4f7f5,#edf1ef_42%,#e7ece9_75%)] px-6 py-10 sm:py-14'>
      <Shell
        eyebrow='Wallet operations overview'
        title='Wallets'
        description='This route will host wallet-level filters, limits, and operational actions. For now it serves as a navigable placeholder.'>
        <FeaturePlaceholder
          eyebrow='Wallet management'
          title='Wallet inventory will live here'
          description='Use this route as the eventual home for wallet drill-downs, balance history, and wallet-specific controls.'
          nextStep='Build wallet-specific cards, filtering, and detail views on top of the existing dashboard payload or a dedicated wallets query.'
        />
      </Shell>
    </main>
  )
}
