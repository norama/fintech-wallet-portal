import { jsonError, jsonValidationError } from '@/lib/api/responses'
import { findActiveUserById } from '@/lib/auth/demoAuth'
import { readDemoSessionUserId } from '@/lib/auth/demoSession'
import { lookupFxRate } from '@/lib/payments/fxRates'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type {
  PaymentAmount,
  PaymentPreviewResponse,
  PaymentPreviewSource,
  PaymentPreviewTarget,
} from '@/lib/types/api'
import { paymentPreviewBodySchema } from '@/lib/validation/paymentSchemas'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const sessionUserId = await readDemoSessionUserId()

  if (!sessionUserId) {
    return jsonError(401, 'UNAUTHORIZED', 'You must sign in first')
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonError(400, 'INVALID_JSON', 'Request body must be valid JSON')
  }

  const parsed = paymentPreviewBodySchema.safeParse(body)
  if (!parsed.success) {
    return jsonValidationError(parsed.error)
  }

  const input = parsed.data

  try {
    const user = await findActiveUserById(sessionUserId)

    if (!user) {
      return jsonError(401, 'UNAUTHORIZED', 'Your session is no longer valid')
    }

    const supabase = createSupabaseServerClient()

    const sourceQuery = await supabase
      .from('wallets')
      .select('id, name, currency, available_balance_minor, status')
      .eq('id', input.sourceWalletId)
      .eq('account_id', user.account_id)
      .maybeSingle()

    if (sourceQuery.error) {
      throw new Error(`Failed to load source wallet: ${sourceQuery.error.message}`)
    }

    if (!sourceQuery.data) {
      return jsonError(
        400,
        'INVALID_SOURCE_WALLET',
        'Source wallet not found or does not belong to your account',
      )
    }

    const sourceWallet = sourceQuery.data

    if (sourceWallet.status === 'suspended') {
      return jsonError(
        400,
        'SOURCE_WALLET_SUSPENDED',
        'The source wallet is suspended and cannot be used for payments',
      )
    }

    if (input.amountMinor > sourceWallet.available_balance_minor) {
      return jsonError(
        400,
        'INSUFFICIENT_FUNDS',
        'Amount exceeds available balance in source wallet',
      )
    }

    const paymentNote = input.paymentNote ?? null
    const balanceAfterMinor = sourceWallet.available_balance_minor - input.amountMinor

    const warnings: string[] = []
    if (balanceAfterMinor < sourceWallet.available_balance_minor * 0.1) {
      warnings.push(
        'Remaining balance will be below 10% of your available balance after this payment.',
      )
    }

    const source: PaymentPreviewSource = {
      walletId: sourceWallet.id,
      walletName: sourceWallet.name,
      currency: sourceWallet.currency,
      availableBalanceMinor: sourceWallet.available_balance_minor,
      balanceAfterMinor,
    }

    if (input.paymentType === 'external_transfer') {
      warnings.push('External transfers are submitted as pending transactions.')

      const target: PaymentPreviewTarget = {
        type: 'external_account',
        name: input.recipientName ?? null,
        ref: input.recipientAccountRef,
        currency: sourceWallet.currency,
      }

      const sendAmount: PaymentAmount = {
        amountMinor: input.amountMinor,
        currency: sourceWallet.currency,
      }

      const response: PaymentPreviewResponse = {
        paymentType: 'external_transfer',
        paymentNote,
        source,
        target,
        sendAmount,
        receiveAmount: sendAmount,
        exchangeRate: null,
        estimatedStatus: 'pending',
        warnings,
      }

      return Response.json(response)
    }

    // own_wallet_transfer
    if (input.targetWalletId === input.sourceWalletId) {
      return jsonError(400, 'SAME_WALLET', 'Target wallet must differ from the source wallet')
    }

    const targetQuery = await supabase
      .from('wallets')
      .select('id, name, currency, status')
      .eq('id', input.targetWalletId)
      .eq('account_id', user.account_id)
      .maybeSingle()

    if (targetQuery.error) {
      throw new Error(`Failed to load target wallet: ${targetQuery.error.message}`)
    }

    if (!targetQuery.data) {
      return jsonError(
        400,
        'INVALID_TARGET_WALLET',
        'Target wallet not found or does not belong to your account',
      )
    }

    const targetWallet = targetQuery.data

    if (targetWallet.status === 'suspended') {
      return jsonError(
        400,
        'TARGET_WALLET_SUSPENDED',
        'The target wallet is suspended and cannot receive payments',
      )
    }

    let receiveAmountMinor = input.amountMinor
    let exchangeRate: number | null = null

    if (sourceWallet.currency !== targetWallet.currency) {
      const rate = lookupFxRate(sourceWallet.currency, targetWallet.currency)

      if (!rate) {
        return jsonError(
          400,
          'FX_RATE_UNAVAILABLE',
          `No FX rate available for ${sourceWallet.currency} to ${targetWallet.currency}`,
        )
      }

      exchangeRate = rate
      receiveAmountMinor = Math.round(input.amountMinor * rate)
      warnings.push('FX rate is mocked for demo purposes.')
    }

    const target: PaymentPreviewTarget = {
      type: 'own_wallet',
      name: targetWallet.name,
      ref: targetWallet.id,
      currency: targetWallet.currency,
    }

    const response: PaymentPreviewResponse = {
      paymentType: 'own_wallet_transfer',
      paymentNote,
      source,
      target,
      sendAmount: { amountMinor: input.amountMinor, currency: sourceWallet.currency },
      receiveAmount: { amountMinor: receiveAmountMinor, currency: targetWallet.currency },
      exchangeRate,
      estimatedStatus: 'completed',
      warnings,
    }

    return Response.json(response)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to generate payment preview'
    return jsonError(500, 'PREVIEW_FAILED', message)
  }
}
