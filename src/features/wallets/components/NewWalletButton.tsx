import Link from 'next/link'

export function NewWalletButton() {
  return (
    <div className='flex items-center justify-end'>
      <Link
        href='/wallets/new'
        className='inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800'>
        New wallet
      </Link>
    </div>
  )
}
