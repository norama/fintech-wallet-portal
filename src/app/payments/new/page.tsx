import { DashboardShell } from '@/features/dashboard/components/DashboardShell'
import { FeaturePlaceholder } from '@/features/dashboard/components/FeaturePlaceholder'
import { requireDemoSessionUserId } from '@/lib/auth/requireDemoSession'

export default async function NewPaymentPage() {
  await requireDemoSessionUserId()

  return (
    <main className='flex min-h-screen justify-center bg-[radial-gradient(circle_at_top,#f4f7f5,#edf1ef_42%,#e7ece9_75%)] px-6 py-10 sm:py-14'>
      <DashboardShell
        eyebrow='Wallet operations overview'
        title='New payment'
        description='This route will become the initiation flow for outbound payments. It is available now so the dashboard navigation is route-based.'>
        <FeaturePlaceholder
          eyebrow='Payments'
          title='Payment initiation placeholder'
          description='The route is wired and authenticated, but the transfer form and validation rules will be built in a later implementation step.'
          nextStep='Build the payment form, beneficiary selection, and review/submit states here when the payments slice starts.'
        />
      </DashboardShell>
    </main>
  )
}
