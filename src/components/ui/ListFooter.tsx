'use client'

import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'

const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const

type ListFooterProps = {
  totalCount: number
  singularLabel: string
  pluralLabel?: string
  /** e.g. "matching current filters" — appended after the count */
  qualifier?: string | undefined
  page: number
  pageCount: number
  pageSize: number
  pageSizeOptions?: readonly number[]
  onPreviousPage: () => void
  onNextPage: () => void
  onPageSizeChange: (pageSize: number) => void
}

export function ListFooter({
  totalCount,
  singularLabel,
  pluralLabel,
  qualifier,
  page,
  pageCount,
  pageSize,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPreviousPage,
  onNextPage,
  onPageSizeChange,
}: ListFooterProps) {
  const noun = totalCount === 1 ? singularLabel : (pluralLabel ?? `${singularLabel}s`)
  const countText = qualifier ? `${totalCount} ${noun} ${qualifier}` : `${totalCount} ${noun}`

  return (
    <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
      <p className='text-sm text-zinc-600'>{countText}</p>
      {pageCount > 1 && (
        <div className='flex items-center gap-2'>
          <div className='w-36'>
            <Select
              aria-label='Items per page'
              value={String(pageSize)}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}>
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </Select>
          </div>
          <Button
            variant='secondary'
            size='sm'
            disabled={page <= 1}
            onClick={onPreviousPage}
            aria-label='Previous page'>
            <span className='leading-none text-3xl text-zinc-600'>‹</span>
          </Button>
          <span className='whitespace-nowrap text-sm text-zinc-600'>
            {page} / {pageCount}
          </span>
          <Button
            variant='secondary'
            size='sm'
            disabled={page >= pageCount}
            onClick={onNextPage}
            aria-label='Next page'>
            <span className='leading-none text-3xl text-zinc-600'>›</span>
          </Button>
        </div>
      )}
    </div>
  )
}
