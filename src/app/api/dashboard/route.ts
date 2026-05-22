import { jsonError, toCamelCaseDeep } from '@/lib/api/responses'
import { findActiveUserById, toBasicUserInfo } from '@/lib/auth/demoAuth'
import { readDemoSessionUserId } from '@/lib/auth/demoSession'
import type { CompanyRow, TransactionRow, WalletRow } from '@/lib/supabase/database.types'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const sessionUserId = await readDemoSessionUserId()

  if (!sessionUserId) {
    return jsonError(401, 'UNAUTHORIZED', 'You must sign in first')
  }

  try {
    const supabase = createSupabaseServerClient()
    const user = await findActiveUserById(sessionUserId)

    if (!user) {
      return jsonError(401, 'UNAUTHORIZED', 'Your session is no longer valid')
    }

    const companyId = user.company_id
    const walletQuery = await supabase.from('wallets').select('*').eq('company_id', companyId)

    if (walletQuery.error) {
      throw new Error(`Failed to load wallets: ${walletQuery.error.message}`)
    }

    const wallets: WalletRow[] = walletQuery.data ?? []
    const walletIds = wallets.map((wallet) => wallet.id)

    const companyQuery = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .maybeSingle()

    if (companyQuery.error) {
      throw new Error(`Failed to load company: ${companyQuery.error.message}`)
    }

    const company: CompanyRow | null = companyQuery.data

    let transactions: TransactionRow[] = []

    if (walletIds.length > 0) {
      const transactionsQuery = await supabase
        .from('transactions')
        .select('*')
        .in('wallet_id', walletIds)
        .order('created_at', { ascending: false })
        .limit(10)

      if (transactionsQuery.error) {
        throw new Error(`Failed to load transactions: ${transactionsQuery.error.message}`)
      }

      transactions = transactionsQuery.data ?? []
    }

    return Response.json(
      toCamelCaseDeep({
        user: toBasicUserInfo(user),
        company,
        wallets,
        transactions,
      }),
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load dashboard'
    return jsonError(500, 'DASHBOARD_LOAD_FAILED', message)
  }
}
