type SegmentOption = {
  value: string
  label: string
  /** Tailwind classes applied to this segment when it is active. Defaults to the white/shadowed style. */
  activeClassName?: string
}

type SwitchProps = {
  options: SegmentOption[]
  value: string
  onChange: (value: string) => void
  id?: string
}

const DEFAULT_ACTIVE = 'border border-zinc-300 bg-white text-zinc-900 shadow-sm'
const INACTIVE = 'text-zinc-500 hover:text-zinc-700'

export function Switch({ options, value, onChange, id }: SwitchProps) {
  return (
    <div className='flex rounded-xl bg-zinc-100 p-1 text-sm font-medium'>
      {options.map((option) => (
        <button
          key={option.value}
          id={id}
          type='button'
          onClick={() => onChange(option.value)}
          className={[
            'flex-1 cursor-pointer rounded-lg px-3 py-2 text-center transition',
            value === option.value ? (option.activeClassName ?? DEFAULT_ACTIVE) : INACTIVE,
          ].join(' ')}>
          {option.label}
        </button>
      ))}
    </div>
  )
}
