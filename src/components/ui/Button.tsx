import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  block?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-zinc-950 text-white hover:bg-zinc-800 disabled:bg-zinc-300 disabled:text-zinc-500',
  secondary:
    'border border-zinc-300 bg-white text-zinc-900 hover:border-zinc-600 hover:bg-zinc-50 disabled:border-zinc-200 disabled:text-zinc-400',
  ghost:
    'bg-transparent text-zinc-700 hover:bg-zinc-100 hover:text-zinc-600 disabled:text-zinc-400',
  danger: 'bg-red-600 text-white hover:bg-red-500 disabled:bg-red-200 disabled:text-red-400',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 rounded-xl px-3 text-sm',
  md: 'h-11 rounded-2xl px-4 text-sm',
  lg: 'h-12 rounded-2xl px-5 text-base',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  block = false,
  type = 'button',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={[
        'inline-flex cursor-pointer items-center justify-center gap-2 font-semibold transition',
        'disabled:cursor-not-allowed',
        block ? 'w-full' : '',
        variantClasses[variant],
        sizeClasses[size],
      ].join(' ')}
      {...props}>
      {children}
    </button>
  )
}
