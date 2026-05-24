import type { ReactNode } from 'react'

type BadgeTone = 'neutral' | 'accent' | 'positive' | 'warning' | 'critical' | 'muted'
type BadgeSize = 'sm' | 'md'

type BadgeProps = {
  children: ReactNode
  tone?: BadgeTone
  size?: BadgeSize
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-zinc-100 text-zinc-700 ring-zinc-200',
  accent: 'bg-sky-100 text-sky-700 ring-sky-200',
  positive: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-100 text-amber-800 ring-amber-200',
  critical: 'bg-red-100 text-red-700 ring-red-200',
  muted: 'bg-stone-100 text-stone-700 ring-stone-200',
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2.5 py-1 text-[11px]',
  md: 'px-3 py-1 text-xs',
}

export function Badge({ children, tone = 'neutral', size = 'md' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full font-semibold uppercase tracking-[0.08em] ring-1 ring-inset',
        toneClasses[tone],
        sizeClasses[size],
      ].join(' ')}>
      {children}
    </span>
  )
}
