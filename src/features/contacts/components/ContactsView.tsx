'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import type { ContactsListItem, ContactsListResponse } from '@/features/contacts/types'
import { ContactStatusBadge, CurrencyPill } from '@/features/overview/components/Badges'
import { formatDateTime } from '@/lib/formatters'

type ContactsViewProps = {
  data?: ContactsListResponse | undefined
  isPending: boolean
  isError: boolean
  errorMessage: string | null
  hasActiveSearch: boolean
  onClearSearch?: (() => void) | undefined
  onPage: (page: number) => void
}

function ContactRow({ contact }: { contact: ContactsListItem }) {
  return (
    <div className='rounded-2xl border border-amber-200/60 bg-white/70 px-5 py-4'>
      {/* Mobile layout */}
      <div className='sm:hidden'>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0'>
            <p className='truncate font-medium text-zinc-950'>{contact.nickname}</p>
            <p className='mt-0.5 text-xs text-zinc-400'>{contact.targetEmail}</p>
          </div>
          <ContactStatusBadge status={contact.status} />
        </div>
        {contact.targetCurrencies.length > 0 && (
          <div className='mt-2 flex flex-wrap gap-1.5'>
            {contact.targetCurrencies.map((c) => (
              <CurrencyPill key={c} currency={c} />
            ))}
          </div>
        )}
        <div className='mt-3 flex items-center justify-between border-t border-amber-100 pt-3'>
          <p className='text-xs text-zinc-400'>{formatDateTime(contact.createdAt)}</p>
          <Link
            href='/payments/new'
            className='text-sm font-medium text-orange-700 transition hover:text-orange-900'>
            Send payment
          </Link>
        </div>
      </div>

      {/* Desktop layout */}
      <div className='hidden sm:grid sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto_auto_auto] sm:items-center sm:gap-x-5'>
        <div className='min-w-0'>
          <p className='truncate font-medium text-zinc-950'>{contact.nickname}</p>
          <p className='mt-0.5 text-xs text-zinc-400'>{contact.targetEmail}</p>
        </div>
        <div className='flex flex-wrap gap-1.5'>
          {contact.targetCurrencies.length > 0 ? (
            contact.targetCurrencies.map((c) => <CurrencyPill key={c} currency={c} />)
          ) : (
            <span className='text-xs text-zinc-400'>No wallets</span>
          )}
        </div>
        <ContactStatusBadge status={contact.status} />
        <div>
          <p className='text-xs text-zinc-400'>Added</p>
          <p className='text-sm text-zinc-700'>{formatDateTime(contact.createdAt)}</p>
        </div>
        <Link
          href='/payments/new'
          className='text-sm font-medium text-orange-700 transition hover:text-orange-900'>
          Send payment
        </Link>
      </div>
    </div>
  )
}

function ContactsListSkeleton() {
  return (
    <div className='space-y-6'>
      <Card tone='status' padding='md'>
        <div className='space-y-3'>
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className='flex items-center gap-4 rounded-2xl border border-amber-200/60 bg-white/70 px-5 py-4'>
              <Skeleton className='h-5 w-40' />
              <Skeleton className='h-4 w-28' />
              <Skeleton className='ml-auto h-4 w-20' />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export function ContactsView({
  data,
  isPending,
  isError,
  errorMessage,
  hasActiveSearch,
  onClearSearch,
  onPage,
}: ContactsViewProps) {
  if (isPending) {
    return <ContactsListSkeleton />
  }

  if (isError) {
    return (
      <Card tone='status' padding='lg' eyebrow='Error' title='Unable to load contacts'>
        <p className='text-sm text-zinc-600'>
          {errorMessage ?? 'An unexpected error occurred. Please try again.'}
        </p>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  const countLabel = `${data.totalCount} ${data.totalCount === 1 ? 'contact' : 'contacts'}${hasActiveSearch ? ' matching search' : ' total'}`

  const footer =
    data.pageCount > 1 ? (
      <div className='flex items-center justify-between'>
        <p className='text-sm text-zinc-500'>{countLabel}</p>
        <div className='flex items-center gap-3'>
          <Button
            variant='secondary'
            size='sm'
            disabled={data.page <= 1}
            onClick={() => onPage(data.page - 1)}>
            Previous
          </Button>
          <span className='text-sm text-zinc-500'>
            {data.page} / {data.pageCount}
          </span>
          <Button
            variant='secondary'
            size='sm'
            disabled={data.page >= data.pageCount}
            onClick={() => onPage(data.page + 1)}>
            Next
          </Button>
        </div>
      </div>
    ) : data.totalCount > 0 ? (
      <p className='text-sm text-zinc-500'>{countLabel}</p>
    ) : undefined

  return (
    <div className='space-y-6'>
      <Card
        tone='status'
        eyebrow='Contact list'
        title='Contacts'
        description='Saved recipients for internal transfers. Select a contact to send a payment to their primary wallet.'
        footer={footer}>
        {data.items.length === 0 ? (
          <div className='py-6 text-center'>
            <p className='text-sm font-medium text-zinc-700'>No contacts found</p>
            {hasActiveSearch ? (
              <>
                <p className='mt-1 text-sm text-zinc-500'>No contacts match your search.</p>
                <div className='mt-6'>
                  <Button variant='secondary' size='sm' onClick={onClearSearch}>
                    Clear search
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className='mt-1 text-sm text-zinc-500'>You have not added any contacts yet.</p>
                <div className='mt-6 flex justify-center'>
                  <Link
                    href='/contacts/new'
                    className='inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800'>
                    New contact
                  </Link>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className='space-y-3'>
            {data.items.map((contact) => (
              <ContactRow key={contact.id} contact={contact} />
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
