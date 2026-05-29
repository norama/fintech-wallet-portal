import { contactListQuerySchema, type ContactListQuery } from '@/lib/validation/contactSchemas'

export type ContactsQueryParams = {
  search?: string | undefined
  page?: number | undefined
  pageSize?: number | undefined
}

export type NormalizedContactsQueryParams = ContactListQuery

export function normalizeContactsQueryParams(
  params: ContactsQueryParams = {},
): NormalizedContactsQueryParams {
  return contactListQuerySchema.parse(params)
}

export function parseContactsSearchParams(
  searchParams: URLSearchParams,
): NormalizedContactsQueryParams {
  const result = contactListQuerySchema.safeParse(Object.fromEntries(searchParams.entries()))

  if (!result.success) {
    return normalizeContactsQueryParams()
  }

  return result.data
}

export function toContactsSearchParams(params: ContactsQueryParams = {}) {
  const normalized = normalizeContactsQueryParams(params)
  const searchParams = new URLSearchParams()

  if (normalized.search) {
    searchParams.set('search', normalized.search)
  }

  if (normalized.page > 1) {
    searchParams.set('page', String(normalized.page))
  }

  if (normalized.pageSize !== 20) {
    searchParams.set('pageSize', String(normalized.pageSize))
  }

  return searchParams
}

export type { ContactsListItem, ContactsListResponse } from '@/lib/types/api'
