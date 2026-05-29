import { NewContact } from '@/features/contacts/components/NewContact'
import { Shell } from '@/features/overview/components/Shell'
import { requireDemoSessionUserId } from '@/lib/auth/requireDemoSession'

export default async function NewContactPage() {
  await requireDemoSessionUserId()

  return (
    <main className='flex min-h-screen justify-center bg-[radial-gradient(circle_at_top,#f4f7f5,#edf1ef_42%,#e7ece9_75%)] px-6 py-10 sm:py-14'>
      <Shell
        eyebrow='Payment contacts'
        title='New contact'
        description='Add a recipient by their registered email address to send them internal payments.'>
        <NewContact />
      </Shell>
    </main>
  )
}
