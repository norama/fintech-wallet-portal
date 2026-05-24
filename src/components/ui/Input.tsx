import type { InputHTMLAttributes } from 'react'

type InputTone = 'default' | 'error'
type InputSpacing = 'default' | 'code'

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  tone?: InputTone
  spacing?: InputSpacing
}

const toneClasses: Record<InputTone, string> = {
  default: 'border-zinc-300 bg-white text-zinc-950 focus:border-zinc-950',
  error: 'border-red-300 bg-red-50/40 text-zinc-950 focus:border-red-500',
}

const spacingClasses: Record<InputSpacing, string> = {
  default: '',
  code: 'tracking-[0.3em]',
}

export function Input({ tone = 'default', spacing = 'default', ...props }: InputProps) {
  return (
    <input
      className={[
        'w-full rounded-2xl border px-4 py-3 text-sm outline-none transition',
        'placeholder:text-zinc-400 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400',
        toneClasses[tone],
        spacingClasses[spacing],
      ].join(' ')}
      {...props}
    />
  )
}
