import { Shell } from '@/features/overview/components/Shell'
import { NewPayment } from '@/features/payments/components/NewPayment'
import { requireDemoSessionUserId } from '@/lib/auth/requireDemoSession'

export default async function NewPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ contactId?: string }>
}) {
  await requireDemoSessionUserId()
  const { contactId } = await searchParams

  return (
    <main className='flex min-h-screen justify-center bg-[radial-gradient(circle_at_top,#f4f7f5,#edf1ef_42%,#e7ece9_75%)] px-6 py-10 sm:py-14'>
      <Shell
        eyebrow='Wallet operations overview'
        title='New payment'
        description='Initiate an external transfer or move funds between your own wallets. Preview before confirming.'>
        <NewPayment initialContactId={contactId} />
      </Shell>
    </main>
  )
}
