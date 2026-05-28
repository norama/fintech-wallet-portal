import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Field } from '@/components/ui/Field'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import {
  DEFAULT_TRANSACTIONS_PAGE_SIZE,
  TRANSACTION_DIRECTION_OPTIONS,
  TRANSACTION_STATUS_OPTIONS,
  TRANSACTION_TYPE_OPTIONS,
  type TransactionsQueryParams,
} from '@/features/transactions/types'
import type { TransactionsFilterWallet } from '@/lib/types/api'

const pageSizeOptions = [10, 20, 50] as const

function toLabel(value: string) {
  return value
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

function parseStatusValue(value: string): TransactionsQueryParams['status'] {
  return TRANSACTION_STATUS_OPTIONS.find((status) => status === value)
}

function parseDirectionValue(value: string): TransactionsQueryParams['direction'] {
  return TRANSACTION_DIRECTION_OPTIONS.find((direction) => direction === value)
}

function parseTransactionTypeValue(value: string): TransactionsQueryParams['transactionType'] {
  return TRANSACTION_TYPE_OPTIONS.find((transactionType) => transactionType === value)
}

type TransactionFiltersProps = {
  activeFilters: TransactionsQueryParams
  wallets: TransactionsFilterWallet[]
  hasActiveFilters: boolean
  onUpdateFilters: (partial: TransactionsQueryParams, options?: { resetPage?: boolean }) => void
  onClearFilters: () => void
}

export function TransactionFilters({
  activeFilters,
  wallets,
  hasActiveFilters,
  onUpdateFilters,
  onClearFilters,
}: TransactionFiltersProps) {
  return (
    <Card tone='transaction' eyebrow='Transaction filters' title='Filters'>
      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        <div className='xl:col-span-3'>
          <Field htmlFor='transactions-search' label='Search'>
            <SearchInput
              id='transactions-search'
              value={activeFilters.search ?? ''}
              onChange={(event) => {
                onUpdateFilters({ search: event.target.value || undefined }, { resetPage: true })
              }}
              onClear={() => {
                onUpdateFilters({ search: undefined }, { resetPage: true })
              }}
              placeholder='Search counterparty or reference'
            />
          </Field>
        </div>

        <Field htmlFor='transactions-wallet' label='Wallet'>
          <Select
            id='transactions-wallet'
            value={activeFilters.walletId ?? ''}
            onChange={(event) => {
              onUpdateFilters({ walletId: event.target.value || undefined }, { resetPage: true })
            }}>
            <option value=''>All wallets</option>
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.name} ({wallet.currency})
              </option>
            ))}
          </Select>
        </Field>

        <Field htmlFor='transactions-status' label='Status'>
          <Select
            id='transactions-status'
            value={activeFilters.status ?? ''}
            onChange={(event) => {
              onUpdateFilters({ status: parseStatusValue(event.target.value) }, { resetPage: true })
            }}>
            <option value=''>All statuses</option>
            {TRANSACTION_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {toLabel(status)}
              </option>
            ))}
          </Select>
        </Field>

        <Field htmlFor='transactions-direction' label='Direction'>
          <Select
            id='transactions-direction'
            value={activeFilters.direction ?? ''}
            onChange={(event) => {
              onUpdateFilters(
                { direction: parseDirectionValue(event.target.value) },
                { resetPage: true },
              )
            }}>
            <option value=''>All directions</option>
            {TRANSACTION_DIRECTION_OPTIONS.map((direction) => (
              <option key={direction} value={direction}>
                {toLabel(direction)}
              </option>
            ))}
          </Select>
        </Field>

        <Field htmlFor='transactions-type' label='Transaction type'>
          <Select
            id='transactions-type'
            value={activeFilters.transactionType ?? ''}
            onChange={(event) => {
              onUpdateFilters(
                { transactionType: parseTransactionTypeValue(event.target.value) },
                { resetPage: true },
              )
            }}>
            <option value=''>All transaction types</option>
            {TRANSACTION_TYPE_OPTIONS.map((transactionType) => (
              <option key={transactionType} value={transactionType}>
                {toLabel(transactionType)}
              </option>
            ))}
          </Select>
        </Field>

        <Field htmlFor='transactions-page-size' label='Page size'>
          <Select
            id='transactions-page-size'
            value={String(activeFilters.pageSize ?? DEFAULT_TRANSACTIONS_PAGE_SIZE)}
            onChange={(event) => {
              onUpdateFilters({ pageSize: Number(event.target.value) }, { resetPage: false })
            }}>
            {pageSizeOptions.map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize} per page
              </option>
            ))}
          </Select>
        </Field>

        <div className='flex items-end justify-end'>
          <Button
            type='button'
            variant='secondary'
            disabled={!hasActiveFilters}
            onClick={onClearFilters}>
            Clear filters
          </Button>
        </div>
      </div>
    </Card>
  )
}
