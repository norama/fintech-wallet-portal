import type { ReactNode } from 'react'

type CardTone =
  | 'default'
  | 'subtle'
  | 'accent'
  | 'wallet'
  | 'transaction'
  | 'status'
  | 'activity'
  | 'alert'
type CardPadding = 'md' | 'lg'

type CardProps = {
  children: ReactNode
  title?: string
  eyebrow?: string
  description?: string
  footer?: ReactNode
  tone?: CardTone
  padding?: CardPadding
}

const toneClasses: Record<CardTone, string> = {
  default: 'border-zinc-200 bg-white',
  subtle: 'border-zinc-200 bg-zinc-50/80',
  accent: 'border-emerald-200 bg-emerald-50/70',
  wallet: 'border-sky-200 bg-sky-50/70',
  transaction: 'border-violet-200 bg-violet-50/60',
  status: 'border-amber-200 bg-amber-50/65',
  activity: 'border-emerald-200 bg-emerald-50/55',
  alert: 'border-rose-200 bg-rose-50/75',
}

const paddingClasses: Record<CardPadding, string> = {
  md: 'p-5',
  lg: 'p-6',
}

export function Card({
  children,
  title,
  eyebrow,
  description,
  footer,
  tone = 'default',
  padding = 'lg',
}: CardProps) {
  return (
    <section
      className={['rounded-3xl border shadow-sm', toneClasses[tone], paddingClasses[padding]].join(
        ' ',
      )}>
      {eyebrow || title || description ? (
        <header className='mb-4 space-y-1'>
          {eyebrow ? (
            <p className='text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500'>
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h2 className='text-lg font-semibold tracking-tight text-zinc-950'>{title}</h2>
          ) : null}
          {description ? <p className='text-sm leading-6 text-zinc-600'>{description}</p> : null}
        </header>
      ) : null}

      <div className='space-y-4'>{children}</div>

      {footer ? <footer className='mt-5 border-t border-zinc-200 pt-4'>{footer}</footer> : null}
    </section>
  )
}
