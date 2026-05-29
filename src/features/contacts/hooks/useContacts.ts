'use client'

import { queryOptions, useQuery } from '@tanstack/react-query'

import { fetchContacts } from '@/features/contacts/api/contactsClient'
import { normalizeContactsQueryParams, type ContactsQueryParams } from '@/features/contacts/types'

export const contactsQueryKeys = {
  list: (params: ContactsQueryParams = {}) => {
    const n = normalizeContactsQueryParams(params)

    return ['contacts', n.search ?? '', n.page, n.pageSize] as const
  },
} as const

export function getContactsQueryOptions(params: ContactsQueryParams = {}) {
  const normalized = normalizeContactsQueryParams(params)

  return queryOptions({
    queryKey: contactsQueryKeys.list(normalized),
    queryFn: () => fetchContacts(normalized),
  })
}

export function useContacts(params: ContactsQueryParams = {}) {
  return useQuery(getContactsQueryOptions(params))
}
