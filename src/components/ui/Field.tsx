import type { ReactNode } from 'react'

type FieldProps = {
  htmlFor: string
  label: string
  hint?: string | undefined
  error?: string | undefined
  children: ReactNode
}

export function Field({ htmlFor, label, hint, error, children }: FieldProps) {
  return (
    <div className='space-y-2'>
      <label htmlFor={htmlFor} className='text-sm font-medium text-zinc-800'>
        {label}
      </label>
      {children}
      {error ? <p className='text-sm text-red-600'>{error}</p> : null}
      {!error && hint ? <p className='text-sm text-zinc-500'>{hint}</p> : null}
    </div>
  )
}
