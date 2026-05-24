'use client'

import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/Button'
import { getSignOutMutationOptions } from '@/lib/query/authQuery'

type DashboardShellProps = {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}

const navigationItems = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/wallets', label: 'Wallets' },
  { href: '/transactions', label: 'Transactions' },
  { href: '/payments/new', label: 'New Payment' },
] as const

function isActiveRoute(pathname: string, href: string) {
  if (href === '/dashboard') {
    return pathname === href
  }

  if (href === '/payments/new') {
    return pathname === href || pathname.startsWith('/payments/')
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function DashboardShell({ eyebrow, title, description, children }: DashboardShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const signOutMutation = useMutation({
    ...getSignOutMutationOptions(),
    onSuccess: async () => {
      await router.push('/sign-in')
      router.refresh()
    },
  })

  async function handleSignOut() {
    await signOutMutation.mutateAsync()
  }

  return (
    <section className='w-full max-w-7xl space-y-6'>
      <header className='h-96 overflow-hidden rounded-4xl border border-zinc-200 bg-white/95 p-6 shadow-sm backdrop-blur sm:h-84 sm:p-8 lg:h-72'>
        <div className='flex h-full flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-8'>
          <div className='flex flex-1 flex-col justify-between gap-5 lg:min-h-0'>
            <div className='h-40 overflow-hidden sm:h-32 lg:h-34'>
              <p className='text-sm font-medium uppercase tracking-[0.22em] text-zinc-500'>
                {eyebrow}
              </p>
              <h1 className='mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl'>
                {title}
              </h1>
              <p className='mt-3 max-w-2xl text-sm leading-6 text-zinc-600'>{description}</p>
            </div>

            <nav className='flex min-h-11 flex-wrap items-start gap-2 lg:min-h-11'>
              {navigationItems.map((item) => {
                const isActive = isActiveRoute(pathname, item.href)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      'rounded-full px-4 py-2 text-sm font-medium transition',
                      isActive
                        ? 'bg-zinc-950 text-white'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-950',
                    ].join(' ')}>
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className='flex min-h-24 flex-col justify-between gap-3 sm:items-end lg:h-full lg:min-h-0'>
            {signOutMutation.error ? (
              <p className='text-sm text-red-600'>{signOutMutation.error.message}</p>
            ) : null}
            <Button
              variant='secondary'
              onClick={handleSignOut}
              disabled={signOutMutation.isPending}>
              {signOutMutation.isPending ? 'Signing out...' : 'Sign out'}
            </Button>
          </div>
        </div>
      </header>

      {children}
    </section>
  )
}
