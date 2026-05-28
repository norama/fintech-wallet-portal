'use client'

import { queryOptions, useQuery } from '@tanstack/react-query'

import { fetchWallets } from '@/features/wallets/api/walletsClient'
import { normalizeWalletsQueryParams, type WalletsQueryParams } from '@/features/wallets/types'

export const walletsQueryKeys = {
  list: (params: WalletsQueryParams = {}) => {
    const normalized = normalizeWalletsQueryParams(params)

    return [
      'wallets',
      normalized.search ?? '',
      normalized.currency ?? '',
      normalized.status ?? '',
      normalized.isPrimary ?? false,
    ] as const
  },
} as const

export function getWalletsQueryOptions(params: WalletsQueryParams = {}) {
  const normalized = normalizeWalletsQueryParams(params)

  return queryOptions({
    queryKey: walletsQueryKeys.list(normalized),
    queryFn: () => fetchWallets(normalized),
  })
}

export function useWallets(params: WalletsQueryParams = {}) {
  return useQuery(getWalletsQueryOptions(params))
}
