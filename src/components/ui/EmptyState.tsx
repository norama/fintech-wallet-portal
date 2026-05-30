import Link from 'next/link'

type Props = {
  title: string
  description: string
  href: string
  buttonLabel: string
}

export function EmptyState({ title, description, href, buttonLabel }: Props) {
  return (
    <div className='py-6 text-center'>
      <p className='text-sm font-medium text-zinc-700'>{title}</p>
      <p className='mt-1 text-sm text-zinc-500'>{description}</p>
      <div className='mt-6 flex justify-center'>
        <Link
          href={href}
          className='inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800'>
          {buttonLabel}
        </Link>
      </div>
    </div>
  )
}
