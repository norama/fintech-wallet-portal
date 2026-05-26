import type { ReactNode, SelectHTMLAttributes } from 'react'

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> & {
  children: ReactNode
}

export function Select({ children, ...props }: SelectProps) {
  return (
    <select
      className='[appearance:base-select] w-full cursor-pointer rounded-2xl border border-zinc-300 bg-white py-3 pl-4 pr-5 text-sm text-zinc-950 outline-none transition focus:border-zinc-950'
      {...props}>
      {children}
    </select>
  )
}
