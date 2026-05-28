import type { CurrencyCode, WalletStatus } from '@/lib/supabase/database.types'
import { walletListQuerySchema, type WalletListQuery } from '@/lib/validation/walletSchemas'

export const WALLET_CURRENCY_OPTIONS = [
  'EUR',
  'CZK',
  'USD',
  'GBP',
] as const satisfies CurrencyCode[]

export const WALLET_STATUS_OPTIONS = [
  'active',
  'limited',
  'suspended',
] as const satisfies WalletStatus[]

export type WalletsQueryParams = {
  search?: string | undefined
  currency?: CurrencyCode | undefined
  status?: WalletStatus | undefined
  isPrimary?: boolean | undefined
}

export type WalletCreateInput = {
  name: string
  currency: CurrencyCode
}

export type NormalizedWalletsQueryParams = WalletListQuery

export function normalizeWalletsQueryParams(
  params: WalletsQueryParams = {},
): NormalizedWalletsQueryParams {
  return walletListQuerySchema.parse(params)
}

export function parseWalletsSearchParams(
  searchParams: URLSearchParams,
): NormalizedWalletsQueryParams {
  const result = walletListQuerySchema.safeParse(Object.fromEntries(searchParams.entries()))

  if (!result.success) {
    return normalizeWalletsQueryParams()
  }

  return result.data
}

export function toWalletsSearchParams(params: WalletsQueryParams = {}) {
  const normalized = normalizeWalletsQueryParams(params)
  const searchParams = new URLSearchParams()

  if (normalized.search) {
    searchParams.set('search', normalized.search)
  }

  if (normalized.currency) {
    searchParams.set('currency', normalized.currency)
  }

  if (normalized.status) {
    searchParams.set('status', normalized.status)
  }

  if (normalized.isPrimary) {
    searchParams.set('isPrimary', 'true')
  }

  return searchParams
}

export type { WalletsListItem, WalletsListResponse, WalletsSummary } from '@/lib/types/api'
