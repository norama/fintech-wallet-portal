import 'server-only'

import { z } from 'zod'

import { toCamelCaseDeep } from '@/lib/api/responses'
import type {
  CurrencyCode,
  TransactionDirection,
  TransactionStatus,
  TransactionType,
  WalletStatus,
} from '@/lib/supabase/database.types'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// ── Shared ─────────────────────────────────────────────────────────────────────

const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

function toStartIso(date: string) {
  return `${date}T00:00:00.000Z`
}

function toEndIso(date: string) {
  return `${date}T23:59:59.999Z`
}

function defaultLast30Days(): { dateFrom: string; dateTo: string } {
  const now = new Date()
  const from = new Date(now)
  from.setDate(from.getDate() - 30)
  return {
    dateFrom: from.toISOString().slice(0, 10),
    dateTo: now.toISOString().slice(0, 10),
  }
}

// ── Result types ───────────────────────────────────────────────────────────────

type WalletItem = {
  id: string
  name: string
  currency: CurrencyCode
  balanceMinor: number
  availableBalanceMinor: number
  reservedBalanceMinor: number
  status: WalletStatus
  isPrimary: boolean
  createdAt: string
}

type CurrencyTotals = {
  currency: CurrencyCode
  walletCount: number
  totalBalanceMinor: number
  totalAvailableMinor: number
  totalReservedMinor: number
}

export type WalletSummaryToolResult = {
  wallets: WalletItem[]
  totalsByCurrency: CurrencyTotals[]
}

type TransactionLite = {
  id: string
  counterpartyName: string
  direction: TransactionDirection
  transactionType: TransactionType
  amountMinor: number
  currency: CurrencyCode
  status: TransactionStatus
  reference: string
  paymentNote: string | null
  createdAt: string
  completedAt: string | null
}

export type RecentTransactionsToolResult = {
  transactions: TransactionLite[]
}

type CurrencyTransactionTotals = {
  currency: CurrencyCode
  outgoingAmountMinor: number
  incomingAmountMinor: number
  transactionCount: number
}

export type TransactionTotalsToolResult = {
  dateFrom: string
  dateTo: string
  totalsByCurrency: CurrencyTransactionTotals[]
  countsByStatus: Record<TransactionStatus, number>
  countsByType: Record<TransactionType, number>
}

type WalletLite = {
  id: string
  name: string
  currency: CurrencyCode
  status: WalletStatus
  balanceMinor: number
  availableBalanceMinor: number
}

export type AttentionItemsToolResult = {
  reviewTransactions: TransactionLite[]
  pendingTransactions: TransactionLite[]
  failedTransactions: TransactionLite[]
  limitedOrSuspendedWallets: WalletLite[]
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function mapTransactionLite(row: {
  id: string
  counterparty_name: string
  direction: TransactionDirection
  transaction_type: TransactionType
  amount_minor: number
  currency: CurrencyCode
  status: TransactionStatus
  reference: string
  payment_note: string | null
  created_at: string
  completed_at: string | null
}): TransactionLite {
  return toCamelCaseDeep(row) as TransactionLite
}

// ── Tool 1: get_wallet_summary ─────────────────────────────────────────────────

/**
 * Answer questions about balances, available/reserved funds, wallet statuses,
 * primary wallets, and liquidity.
 */
export async function getWalletSummary(accountId: string): Promise<WalletSummaryToolResult> {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('account_id', accountId)
    .order('currency')
    .order('name')

  if (error) throw new Error(`getWalletSummary: ${error.message}`)

  const wallets: WalletItem[] = (data ?? []).map((w) => toCamelCaseDeep(w) as WalletItem)

  const byCurrency = new Map<CurrencyCode, CurrencyTotals>()
  for (const w of wallets) {
    const existing = byCurrency.get(w.currency)
    if (existing) {
      existing.walletCount += 1
      existing.totalBalanceMinor += w.balanceMinor
      existing.totalAvailableMinor += w.availableBalanceMinor
      existing.totalReservedMinor += w.reservedBalanceMinor
    } else {
      byCurrency.set(w.currency, {
        currency: w.currency,
        walletCount: 1,
        totalBalanceMinor: w.balanceMinor,
        totalAvailableMinor: w.availableBalanceMinor,
        totalReservedMinor: w.reservedBalanceMinor,
      })
    }
  }

  return {
    wallets,
    totalsByCurrency: Array.from(byCurrency.values()),
  }
}

// ── Tool 2: get_recent_transactions ───────────────────────────────────────────

/**
 * Answer questions about recent activity, pending items, outgoing payments,
 * incoming payments, specific statuses, currencies, and date ranges.
 */
export async function getRecentTransactions(
  accountId: string,
  input: {
    limit?: number | null
    status?: TransactionStatus | null
    direction?: TransactionDirection | null
    currency?: CurrencyCode | null
    dateFrom?: string | null
    dateTo?: string | null
  },
): Promise<RecentTransactionsToolResult> {
  const limit = Math.min(input.limit ?? 20, 50)

  const fromIso = input.dateFrom ? toStartIso(dateStringSchema.parse(input.dateFrom)) : undefined
  const toIso = input.dateTo ? toEndIso(dateStringSchema.parse(input.dateTo)) : undefined

  const supabase = createSupabaseServerClient()

  let query = supabase
    .from('transactions')
    .select('*')
    .eq('account_id', accountId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (input.status) query = query.eq('status', input.status)
  if (input.direction) query = query.eq('direction', input.direction)
  if (input.currency) query = query.eq('currency', input.currency)
  if (fromIso) query = query.gte('created_at', fromIso)
  if (toIso) query = query.lte('created_at', toIso)

  const { data, error } = await query

  if (error) throw new Error(`getRecentTransactions: ${error.message}`)

  return { transactions: (data ?? []).map(mapTransactionLite) }
}

// ── Tool 3: get_transaction_totals ────────────────────────────────────────────

/**
 * Answer summary questions such as:
 * - How much went out recently?
 * - What are totals by currency?
 * - How many transactions are pending/requires_review?
 * - What happened this month?
 * Defaults to the last 30 days if no date range is provided.
 */
export async function getTransactionTotals(
  accountId: string,
  input: {
    dateFrom?: string | null
    dateTo?: string | null
    currency?: CurrencyCode | null
  },
): Promise<TransactionTotalsToolResult> {
  const defaults = defaultLast30Days()
  const dateFrom = input.dateFrom ?? defaults.dateFrom
  const dateTo = input.dateTo ?? defaults.dateTo

  dateStringSchema.parse(dateFrom)
  dateStringSchema.parse(dateTo)

  const fromIso = toStartIso(dateFrom)
  const toIso = toEndIso(dateTo)

  const supabase = createSupabaseServerClient()

  let query = supabase
    .from('transactions')
    .select('*')
    .eq('account_id', accountId)
    .gte('created_at', fromIso)
    .lte('created_at', toIso)

  if (input.currency) query = query.eq('currency', input.currency)

  const { data, error } = await query

  if (error) throw new Error(`getTransactionTotals: ${error.message}`)

  const rows = data ?? []

  const byCurrency = new Map<CurrencyCode, CurrencyTransactionTotals>()
  const countsByStatus = {} as Record<TransactionStatus, number>
  const countsByType = {} as Record<TransactionType, number>

  for (const row of rows) {
    // currency totals
    const existing = byCurrency.get(row.currency)
    if (existing) {
      existing.transactionCount += 1
      if (row.direction === 'outgoing') existing.outgoingAmountMinor += row.amount_minor
      else existing.incomingAmountMinor += row.amount_minor
    } else {
      byCurrency.set(row.currency, {
        currency: row.currency,
        transactionCount: 1,
        outgoingAmountMinor: row.direction === 'outgoing' ? row.amount_minor : 0,
        incomingAmountMinor: row.direction === 'incoming' ? row.amount_minor : 0,
      })
    }

    // status counts
    countsByStatus[row.status] = (countsByStatus[row.status] ?? 0) + 1

    // type counts
    countsByType[row.transaction_type] = (countsByType[row.transaction_type] ?? 0) + 1
  }

  return {
    dateFrom,
    dateTo,
    totalsByCurrency: Array.from(byCurrency.values()),
    countsByStatus,
    countsByType,
  }
}

// ── Tool 4: get_attention_items ───────────────────────────────────────────────

/**
 * Answer "what needs attention?" quickly and reliably.
 * Returns transactions requiring review, pending transactions, failed transactions,
 * and limited or suspended wallets for the given account.
 */
export async function getAttentionItems(accountId: string): Promise<AttentionItemsToolResult> {
  const supabase = createSupabaseServerClient()

  const [txResult, walletResult] = await Promise.all([
    supabase
      .from('transactions')
      .select('*')
      .eq('account_id', accountId)
      .in('status', ['requires_review', 'pending', 'failed'])
      .order('created_at', { ascending: false }),
    supabase
      .from('wallets')
      .select('*')
      .eq('account_id', accountId)
      .in('status', ['limited', 'suspended'])
      .order('currency')
      .order('name'),
  ])

  if (txResult.error) throw new Error(`getAttentionItems (transactions): ${txResult.error.message}`)
  if (walletResult.error)
    throw new Error(`getAttentionItems (wallets): ${walletResult.error.message}`)

  const allTx = txResult.data ?? []
  const limit = 10

  const reviewTransactions = allTx
    .filter((r) => r.status === 'requires_review')
    .slice(0, limit)
    .map(mapTransactionLite)

  const pendingTransactions = allTx
    .filter((r) => r.status === 'pending')
    .slice(0, limit)
    .map(mapTransactionLite)

  const failedTransactions = allTx
    .filter((r) => r.status === 'failed')
    .slice(0, limit)
    .map(mapTransactionLite)

  const limitedOrSuspendedWallets = (walletResult.data ?? []).map(
    (w): WalletLite => toCamelCaseDeep(w) as WalletLite,
  )

  return {
    reviewTransactions,
    pendingTransactions,
    failedTransactions,
    limitedOrSuspendedWallets,
  }
}
