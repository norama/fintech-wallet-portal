import type { InputHTMLAttributes } from 'react'

type SearchInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  onClear?: () => void
}

export function SearchInput({ onClear, value, ...props }: SearchInputProps) {
  const showClear = Boolean(value) && onClear !== undefined

  return (
    <div className='relative'>
      <input
        value={value}
        className={[
          'w-full rounded-2xl border py-3 text-sm outline-none transition',
          'placeholder:text-zinc-400 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400',
          'border-zinc-300 bg-white text-zinc-950 focus:border-zinc-950',
          showClear ? 'pl-4 pr-10' : 'px-4',
        ].join(' ')}
        {...props}
      />
      {showClear ? (
        <button
          type='button'
          onClick={onClear}
          aria-label='Clear search'
          className='absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-1.5 text-zinc-400 transition hover:text-zinc-700'>
          <svg
            width='10'
            height='10'
            viewBox='0 0 14 14'
            fill='none'
            aria-hidden='true'
            xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M1 1L13 13M13 1L1 13'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
            />
          </svg>
        </button>
      ) : null}
    </div>
  )
}
