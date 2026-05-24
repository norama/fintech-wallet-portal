import type { ReactNode } from 'react'

type AlertTone = 'info' | 'success' | 'warning' | 'danger'

type AlertProps = {
  title: string
  description: string
  tone?: AlertTone
  action?: ReactNode
}

const toneClasses: Record<AlertTone, string> = {
  info: 'border-sky-200 bg-sky-50 text-sky-900',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  danger: 'border-red-200 bg-red-50 text-red-900',
}

export function Alert({ title, description, tone = 'info', action }: AlertProps) {
  return (
    <div className={['rounded-2xl border px-4 py-4', toneClasses[tone]].join(' ')}>
      <div className='flex items-start justify-between gap-4'>
        <div className='space-y-1'>
          <p className='text-sm font-semibold'>{title}</p>
          <p className='text-sm leading-6 opacity-90'>{description}</p>
        </div>
        {action ? <div className='shrink-0'>{action}</div> : null}
      </div>
    </div>
  )
}
