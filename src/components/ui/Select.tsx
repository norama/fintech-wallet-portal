import type { ReactNode, SelectHTMLAttributes } from 'react'

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> & {
  children: ReactNode
}

export function Select({ children, ...props }: SelectProps) {
  return (
    <select
      className='h-11 w-full rounded-2xl border border-zinc-300 bg-white px-4 text-sm text-zinc-950 outline-none transition focus:border-zinc-950'
      {...props}>
      {children}
    </select>
  )
}
