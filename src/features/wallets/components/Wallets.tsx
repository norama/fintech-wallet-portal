'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { WalletsRequestError } from '@/features/wallets/api/walletsClient'
import { WalletFilters } from '@/features/wallets/components/WalletFilters'
import { WalletsView } from '@/features/wallets/components/WalletsView'
import { useWallets } from '@/features/wallets/hooks/useWallets'
import {
  parseWalletsSearchParams,
  toWalletsSearchParams,
  type WalletsQueryParams,
} from '@/features/wallets/types'
import { NewWalletButton } from './NewWalletButton'

export function Wallets() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeFilters = parseWalletsSearchParams(new URLSearchParams(searchParams.toString()))
  const walletsQuery = useWallets(activeFilters)

  useEffect(() => {
    if (walletsQuery.error instanceof WalletsRequestError && walletsQuery.error.status === 401) {
      router.replace('/sign-in')
    }
  }, [walletsQuery.error, router])

  const requestError = walletsQuery.error instanceof WalletsRequestError ? walletsQuery.error : null
  const isUnauthorized = requestError?.status === 401
  const errorMessage = !isUnauthorized && requestError ? requestError.message : null

  const hasActiveFilters =
    Boolean(activeFilters.search) ||
    Boolean(activeFilters.currency) ||
    Boolean(activeFilters.status) ||
    Boolean(activeFilters.isPrimary)

  function replaceSearchParams(nextParams: WalletsQueryParams) {
    const nextSearchParams = toWalletsSearchParams(nextParams)
    const queryString = nextSearchParams.toString()

    router.replace(queryString.length > 0 ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    })
  }

  function updateFilters(nextPartial: WalletsQueryParams) {
    const nextParams: WalletsQueryParams = {
      ...activeFilters,
      ...nextPartial,
      page: 1,
    }

    replaceSearchParams(nextParams)
  }

  function handlePage(page: number) {
    replaceSearchParams({ ...activeFilters, page })
  }

  function handlePageSize(pageSize: number) {
    replaceSearchParams({ ...activeFilters, pageSize, page: 1 })
  }

  function clearFilters() {
    replaceSearchParams({})
  }

  return (
    <div className='space-y-6'>
      <NewWalletButton />

      <WalletFilters
        activeFilters={activeFilters}
        onUpdateFilters={updateFilters}
        onClearFilters={clearFilters}
      />

      {errorMessage ? (
        <Alert
          tone='danger'
          title='Wallets unavailable'
          description={errorMessage}
          action={
            <Button variant='secondary' size='sm' onClick={() => void walletsQuery.refetch()}>
              Retry
            </Button>
          }
        />
      ) : null}

      <WalletsView
        data={walletsQuery.data}
        isPending={walletsQuery.isPending}
        isError={walletsQuery.isError && !isUnauthorized}
        errorMessage={errorMessage}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        onPage={handlePage}
        onPageSize={handlePageSize}
      />
    </div>
  )
}
