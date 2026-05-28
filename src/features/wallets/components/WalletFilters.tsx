'use client'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import {
  WALLET_CURRENCY_OPTIONS,
  WALLET_STATUS_OPTIONS,
  type WalletsQueryParams,
} from '@/features/wallets/types'

function toLabel(value: string) {
  return value
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

function parseCurrencyValue(value: string): WalletsQueryParams['currency'] {
  return WALLET_CURRENCY_OPTIONS.find((currency) => currency === value)
}

function parseStatusValue(value: string): WalletsQueryParams['status'] {
  return WALLET_STATUS_OPTIONS.find((status) => status === value)
}

type WalletFiltersProps = {
  activeFilters: WalletsQueryParams
  onUpdateFilters: (partial: WalletsQueryParams) => void
  onClearFilters: () => void
}

export function WalletFilters({
  activeFilters,
  onUpdateFilters,
  onClearFilters,
}: WalletFiltersProps) {
  const hasActiveFilters =
    Boolean(activeFilters.search) ||
    Boolean(activeFilters.currency) ||
    Boolean(activeFilters.status)

  return (
    <Card
      tone='wallet'
      eyebrow='Wallet filters'
      title='Filter toolbar'
      description='Filter by wallet name, currency, or status. Selections sync with the URL.'>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        <div className='sm:col-span-2 lg:col-span-3'>
          <Field htmlFor='wallets-search' label='Search'>
            <Input
              id='wallets-search'
              value={activeFilters.search ?? ''}
              onChange={(event) => {
                onUpdateFilters({ search: event.target.value || undefined })
              }}
              placeholder='Search wallet name'
            />
          </Field>
        </div>

        <Field htmlFor='wallets-currency' label='Currency'>
          <Select
            id='wallets-currency'
            value={activeFilters.currency ?? ''}
            onChange={(event) => {
              onUpdateFilters({ currency: parseCurrencyValue(event.target.value) })
            }}>
            <option value=''>All currencies</option>
            {WALLET_CURRENCY_OPTIONS.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </Select>
        </Field>

        <Field htmlFor='wallets-status' label='Status'>
          <Select
            id='wallets-status'
            value={activeFilters.status ?? ''}
            onChange={(event) => {
              onUpdateFilters({ status: parseStatusValue(event.target.value) })
            }}>
            <option value=''>All statuses</option>
            {WALLET_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {toLabel(status)}
              </option>
            ))}
          </Select>
        </Field>

        <div className='flex items-end'>
          <Button variant='secondary' disabled={!hasActiveFilters} onClick={onClearFilters}>
            Clear filters
          </Button>
        </div>
      </div>
    </Card>
  )
}
