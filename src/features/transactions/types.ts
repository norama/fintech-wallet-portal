import type {
  TransactionDirection,
  TransactionStatus,
  TransactionType,
} from '@/lib/supabase/database.types'

export type TransactionsQueryParams = {
  page?: number | undefined
  pageSize?: number | undefined
  search?: string | undefined
  walletId?: string | undefined
  status?: TransactionStatus | undefined
  direction?: TransactionDirection | undefined
  transactionType?: TransactionType | undefined
}

export type { TransactionsListResponse } from '@/lib/types/api'
