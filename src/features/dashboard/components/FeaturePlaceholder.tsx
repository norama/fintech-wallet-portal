import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

type FeaturePlaceholderProps = {
  eyebrow: string
  title: string
  description: string
  nextStep: string
}

export function FeaturePlaceholder({
  eyebrow,
  title,
  description,
  nextStep,
}: FeaturePlaceholderProps) {
  return (
    <div className='grid gap-6 lg:grid-cols-[1.5fr_1fr]'>
      <Card tone='activity' eyebrow={eyebrow} title={title} description={description}>
        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='rounded-2xl border border-emerald-200 bg-white/70 px-4 py-3'>
            <p className='text-sm font-medium text-zinc-500'>Route status</p>
            <p className='mt-1 text-lg font-semibold tracking-tight text-zinc-950'>Available now</p>
          </div>
          <div className='rounded-2xl border border-emerald-200 bg-white/70 px-4 py-3'>
            <p className='text-sm font-medium text-zinc-500'>Build state</p>
            <p className='mt-1 text-lg font-semibold tracking-tight text-zinc-950'>
              Waiting on next slice
            </p>
          </div>
        </div>
        <Alert
          tone='info'
          title='Feature placeholder'
          description='This route is already part of the authenticated shell, but the detailed product workflow is intentionally deferred for a later slice.'
        />
        <Alert
          tone='warning'
          title='Implementation status'
          description='Use this page to validate navigation, shell behavior, and section styling until the route receives its dedicated feature logic.'
        />
      </Card>

      <Card tone='status' eyebrow='Next step' title='Implementation note' description={nextStep}>
        <div className='rounded-2xl border border-amber-200 bg-white/70 px-4 py-3 text-sm text-zinc-700'>
          This placeholder follows the same shared card system as sign-in and dashboard states, so
          future route work can focus on behavior instead of rebuilding the layout shell.
        </div>
        <Button variant='secondary' size='sm' disabled>
          Feature coming later
        </Button>
      </Card>
    </div>
  )
}
