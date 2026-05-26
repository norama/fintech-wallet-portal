import { jsonError, toCamelCaseDeep } from '@/lib/api/responses'
import { findActiveUserById } from '@/lib/auth/demoAuth'
import { readDemoSessionUserId } from '@/lib/auth/demoSession'
import { FX_RATES } from '@/lib/payments/fxRates'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { PaymentsOptionsResponse, PaymentsWallet } from '@/lib/types/api'

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

    const response: PaymentsOptionsResponse = { wallets, fxRates: FX_RATES }

    return Response.json(response)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load payment options'
    return jsonError(500, 'PAYMENTS_OPTIONS_LOAD_FAILED', message)
  }
}
