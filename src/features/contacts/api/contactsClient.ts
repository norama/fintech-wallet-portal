import type {
  ContactsListItem,
  ContactsListResponse,
  ContactsQueryParams,
} from '@/features/contacts/types'
import { toContactsSearchParams } from '@/features/contacts/types'

type ContactsApiErrorResponse = {
  error?: {
    code?: string
    message?: string
  }
}

export class ContactsRequestError extends Error {
  status: number
  code: string | null

  constructor(message: string, status: number, code: string | null = null) {
    super(message)
    this.name = 'ContactsRequestError'
    this.status = status
    this.code = code
  }
}

function extractErrorFields(body: ContactsApiErrorResponse | null) {
  const code = body?.error?.code ?? null
  const message = body?.error?.message ?? null
  return { code, message }
}

export async function fetchContacts(
  params: ContactsQueryParams = {},
): Promise<ContactsListResponse> {
  const searchParams = toContactsSearchParams(params)
  const queryString = searchParams.toString()
  const url = queryString.length > 0 ? `/api/contacts?${queryString}` : '/api/contacts'

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  })

  const body = (await response.json().catch(() => null)) as
    | ContactsListResponse
    | ContactsApiErrorResponse
    | null

  if (!response.ok) {
    const { code, message } = extractErrorFields(
      body && 'error' in body ? (body as ContactsApiErrorResponse) : null,
    )
    throw new ContactsRequestError(message ?? 'Unable to load contacts', response.status, code)
  }

  return body as ContactsListResponse
}

export type ContactCreateInput = {
  email: string
  nickname: string
}

export async function createContact(input: ContactCreateInput): Promise<ContactsListItem> {
  const response = await fetch('/api/contacts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
    cache: 'no-store',
  })

  const body = (await response.json().catch(() => null)) as
    | ContactsListItem
    | ContactsApiErrorResponse
    | null

  if (!response.ok) {
    const { code, message } = extractErrorFields(
      body && 'error' in body ? (body as ContactsApiErrorResponse) : null,
    )
    throw new ContactsRequestError(message ?? 'Unable to create contact', response.status, code)
  }

  return body as ContactsListItem
}
