import { jsonError, toCamelCaseDeep } from '@/lib/api/responses'
import { findActiveUserById } from '@/lib/auth/demoAuth'
import { readDemoSessionUserId } from '@/lib/auth/demoSession'
import { FX_RATES } from '@/lib/payments/fxRates'
import type { CurrencyCode } from '@/lib/supabase/database.types'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { PaymentsContact, PaymentsOptionsResponse, PaymentsWallet } from '@/lib/types/api'

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

    const walletQuery = await supabase
      .from('wallets')
      .select(
        'id, name, currency, balance_minor, available_balance_minor, reserved_balance_minor, status',
      )
      .eq('account_id', user.account_id)
      .order('created_at', { ascending: true })

    if (walletQuery.error) {
      throw new Error(`Failed to load wallets: ${walletQuery.error.message}`)
    }

    const wallets = toCamelCaseDeep(walletQuery.data ?? []) as PaymentsWallet[]

    // Load active contacts with their target account info and available currencies
    const contactQuery = await supabase
      .from('payment_contacts')
      .select('id, nickname, target_account_id')
      .eq('owner_account_id', user.account_id)
      .eq('status', 'active')
      .order('nickname', { ascending: true })

    if (contactQuery.error) {
      throw new Error(`Failed to load contacts: ${contactQuery.error.message}`)
    }

    const contactRows = contactQuery.data ?? []
    const targetAccountIds = [...new Set(contactRows.map((c) => c.target_account_id))]

    let contacts: PaymentsContact[] = []

    if (targetAccountIds.length > 0) {
      const [accountQuery, targetWalletQuery] = await Promise.all([
        supabase
          .from('accounts')
          .select('id, display_name, account_type, verification_status')
          .in('id', targetAccountIds),
        supabase
          .from('wallets')
          .select('account_id, currency')
          .in('account_id', targetAccountIds)
          .eq('status', 'active'),
      ])

      if (accountQuery.error) {
        throw new Error(`Failed to load contact accounts: ${accountQuery.error.message}`)
      }
      if (targetWalletQuery.error) {
        throw new Error(`Failed to load contact wallets: ${targetWalletQuery.error.message}`)
      }

      const accountById = new Map((accountQuery.data ?? []).map((a) => [a.id, a]))
      const currenciesByAccountId = new Map<string, CurrencyCode[]>()
      for (const w of targetWalletQuery.data ?? []) {
        const list = currenciesByAccountId.get(w.account_id) ?? []
        const currency = w.currency as CurrencyCode
        if (!list.includes(currency)) list.push(currency)
        currenciesByAccountId.set(w.account_id, list)
      }

      contacts = contactRows.flatMap((c) => {
        const account = accountById.get(c.target_account_id)
        if (!account) return []
        return [
          {
            id: c.id,
            nickname: c.nickname,
            targetAccount: {
              displayName: account.display_name,
              accountType: account.account_type,
              verificationStatus: account.verification_status,
            },
            availableCurrencies: currenciesByAccountId.get(c.target_account_id) ?? [],
          },
        ]
      })
    }

    const response: PaymentsOptionsResponse = { wallets, fxRates: FX_RATES, contacts }

    return Response.json(response)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load payment options'
    return jsonError(500, 'PAYMENTS_OPTIONS_LOAD_FAILED', message)
  }
}
