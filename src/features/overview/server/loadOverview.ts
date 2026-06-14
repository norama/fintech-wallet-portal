// src/features/overview/server/loadOverview.ts
import 'server-only'

import { toCamelCaseDeep } from '@/lib/api/responses'
import { findActiveUserById, toBasicUserInfo } from '@/lib/auth/demoAuth'
import { readDemoSessionUserId } from '@/lib/auth/demoSession'
import type { AccountRow, TransactionRow, WalletRow } from '@/lib/supabase/database.types'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { OverviewResponse } from '@/lib/types/api'

export class OverviewAuthError extends Error {
  constructor(message = 'You must sign in first') {
    super(message)
    this.name = 'OverviewAuthError'
  }
}

export class OverviewLoadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OverviewLoadError'
  }
}

export async function loadOverview() {
  const sessionUserId = await readDemoSessionUserId()

  if (!sessionUserId) {
    throw new OverviewAuthError('You must sign in first')
  }

  const user = await findActiveUserById(sessionUserId)

  if (!user) {
    throw new OverviewAuthError('Your session is no longer valid')
  }

  const accountId = user.account_id
  const supabase = createSupabaseServerClient()

  const [walletQuery, accountQuery] = await Promise.all([
    supabase.from('wallets').select('*').eq('account_id', accountId),
    supabase.from('accounts').select('*').eq('id', accountId).maybeSingle(),
  ])

  if (walletQuery.error) {
    throw new OverviewLoadError(`Failed to load wallets: ${walletQuery.error.message}`)
  }

  if (accountQuery.error) {
    throw new OverviewLoadError(`Failed to load account: ${accountQuery.error.message}`)
  }

  const wallets: WalletRow[] = walletQuery.data ?? []
  const account: AccountRow | null = accountQuery.data
  const walletIds = wallets.map((wallet) => wallet.id)

  let transactions: TransactionRow[] = []

  if (walletIds.length > 0) {
    const transactionsQuery = await supabase
      .from('transactions')
      .select('*')
      .in('wallet_id', walletIds)
      .order('created_at', { ascending: false })
      .limit(10)

    if (transactionsQuery.error) {
      throw new OverviewLoadError(`Failed to load transactions: ${transactionsQuery.error.message}`)
    }

    transactions = transactionsQuery.data ?? []
  }

  return toCamelCaseDeep({
    user: toBasicUserInfo(user),
    account,
    wallets,
    transactions,
  }) as OverviewResponse
}
