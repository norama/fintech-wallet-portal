'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Field } from '@/components/ui/Field'
import { SearchInput } from '@/components/ui/SearchInput'
import { ContactsRequestError } from '@/features/contacts/api/contactsClient'
import { ContactsView } from '@/features/contacts/components/ContactsView'
import { useContacts } from '@/features/contacts/hooks/useContacts'
import {
  parseContactsSearchParams,
  toContactsSearchParams,
  type ContactsQueryParams,
} from '@/features/contacts/types'

export function Contacts() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeParams = parseContactsSearchParams(new URLSearchParams(searchParams.toString()))
  const contactsQuery = useContacts(activeParams)

  useEffect(() => {
    if (contactsQuery.error instanceof ContactsRequestError && contactsQuery.error.status === 401) {
      router.replace('/sign-in')
    }
  }, [contactsQuery.error, router])

  const requestError =
    contactsQuery.error instanceof ContactsRequestError ? contactsQuery.error : null
  const isUnauthorized = requestError?.status === 401
  const errorMessage = !isUnauthorized && requestError ? requestError.message : null

  function replaceParams(nextParams: ContactsQueryParams) {
    const nextSearchParams = toContactsSearchParams(nextParams)
    const queryString = nextSearchParams.toString()

    router.replace(queryString.length > 0 ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    })
  }

  function handleSearchChange(search: string | undefined) {
    replaceParams({ search, page: 1, pageSize: activeParams.pageSize })
  }

  function handlePage(page: number) {
    replaceParams({ ...activeParams, page })
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-end'>
        <Link
          href='/contacts/new'
          className='inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800'>
          New contact
        </Link>
      </div>

      <Card tone='status' padding='md'>
        <Field htmlFor='contacts-search' label='Search'>
          <SearchInput
            id='contacts-search'
            value={activeParams.search ?? ''}
            onChange={(e) => handleSearchChange(e.target.value || undefined)}
            onClear={() => handleSearchChange(undefined)}
            placeholder='Search by nickname'
          />
        </Field>
      </Card>

      {errorMessage ? (
        <Alert
          tone='danger'
          title='Contacts unavailable'
          description={errorMessage}
          action={
            <Button variant='secondary' size='sm' onClick={() => void contactsQuery.refetch()}>
              Retry
            </Button>
          }
        />
      ) : null}

      <ContactsView
        data={contactsQuery.data}
        isPending={contactsQuery.isPending}
        isError={contactsQuery.isError && !isUnauthorized}
        errorMessage={errorMessage}
        hasActiveSearch={Boolean(activeParams.search)}
        onClearSearch={() => handleSearchChange(undefined)}
        onPage={handlePage}
      />
    </div>
  )
}
