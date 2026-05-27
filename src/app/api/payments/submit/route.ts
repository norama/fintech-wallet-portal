import { jsonError, jsonValidationError } from '@/lib/api/responses'
import { findActiveUserById } from '@/lib/auth/demoAuth'
import { readDemoSessionUserId } from '@/lib/auth/demoSession'
import { lookupFxRate } from '@/lib/payments/fxRates'
import { generateReference } from '@/lib/payments/referenceUtils'
import type { TransactionRow } from '@/lib/supabase/database.types'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { PaymentSubmitResponse, PaymentSubmitTransactionItem } from '@/lib/types/api'
import { paymentSubmitBodySchema } from '@/lib/validation/paymentSchemas'

export const dynamic = 'force-dynamic'

const DEMO_AUTHORIZATION_CODE = '123456'

type InsertedTxRow = Pick<
  TransactionRow,
  | 'id'
  | 'wallet_id'
  | 'direction'
  | 'transaction_type'
  | 'status'
  | 'amount_minor'
  | 'currency'
  | 'payment_note'
  | 'reference'
>

function mapTransaction(row: InsertedTxRow): PaymentSubmitTransactionItem {
  return {
    id: row.id,
    walletId: row.wallet_id,
    direction: row.direction,
    transactionType: row.transaction_type,
    status: row.status,
    amountMinor: row.amount_minor,
    currency: row.currency,
    paymentNote: row.payment_note,
    reference: row.reference,
  }
}

const TX_SELECT =
  'id, wallet_id, direction, transaction_type, status, amount_minor, currency, payment_note, reference' as const

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

  const parsed = paymentSubmitBodySchema.safeParse(body)
  if (!parsed.success) {
    return jsonValidationError(parsed.error)
  }

  const input = parsed.data

  if (
    input.paymentType === 'external_transfer' &&
    input.authorizationCode !== DEMO_AUTHORIZATION_CODE
  ) {
    return jsonError(400, 'INVALID_AUTHORIZATION_CODE', 'The confirmation code is incorrect.')
  }

  try {
    const user = await findActiveUserById(sessionUserId)

    if (!user) {
      return jsonError(401, 'UNAUTHORIZED', 'Your session is no longer valid')
    }

    const supabase = createSupabaseServerClient()

    const sourceQuery = await supabase
      .from('wallets')
      .select(
        'id, name, currency, balance_minor, available_balance_minor, reserved_balance_minor, status',
      )
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

    const reference = generateReference(input.paymentType)
    const paymentNote = input.paymentNote ?? null

    // ── External transfer ──────────────────────────────────────────────────────

    if (input.paymentType === 'external_transfer') {
      const insertResult = await supabase
        .from('transactions')
        .insert({
          account_id: user.account_id,
          wallet_id: sourceWallet.id,
          direction: 'outgoing' as const,
          transaction_type: 'bank_transfer' as const,
          counterparty_type: 'external_account' as const,
          counterparty_name: input.recipientName ?? '',
          counterparty_ref: input.recipientAccountRef,
          amount_minor: input.amountMinor,
          currency: sourceWallet.currency,
          payment_note: paymentNote,
          status: 'pending' as const,
          reference,
          completed_at: null,
        })
        .select(TX_SELECT)

      if (insertResult.error) {
        throw new Error(`Failed to insert transaction: ${insertResult.error.message}`)
      }

      const walletUpdate = await supabase
        .from('wallets')
        .update({
          available_balance_minor: sourceWallet.available_balance_minor - input.amountMinor,
          reserved_balance_minor: sourceWallet.reserved_balance_minor + input.amountMinor,
        })
        .eq('id', sourceWallet.id)
        .eq('account_id', user.account_id)

      if (walletUpdate.error) {
        throw new Error(`Failed to update source wallet: ${walletUpdate.error.message}`)
      }

      const response: PaymentSubmitResponse = {
        status: 'pending',
        reference,
        createdTransactions: insertResult.data.map(mapTransaction),
      }

      return Response.json(response, { status: 201 })
    }

    // ── Own wallet transfer ────────────────────────────────────────────────────

    if (input.targetWalletId === input.sourceWalletId) {
      return jsonError(400, 'SAME_WALLET', 'Target wallet must differ from the source wallet')
    }

    const targetQuery = await supabase
      .from('wallets')
      .select(
        'id, name, currency, balance_minor, available_balance_minor, reserved_balance_minor, status',
      )
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

    if (sourceWallet.currency !== targetWallet.currency) {
      const rate = lookupFxRate(sourceWallet.currency, targetWallet.currency)

      if (!rate) {
        return jsonError(
          400,
          'FX_RATE_UNAVAILABLE',
          `No FX rate available for ${sourceWallet.currency} to ${targetWallet.currency}`,
        )
      }

      receiveAmountMinor = Math.round(input.amountMinor * rate)
    }

    const now = new Date().toISOString()

    const insertResult = await supabase
      .from('transactions')
      .insert([
        {
          account_id: user.account_id,
          wallet_id: sourceWallet.id,
          direction: 'outgoing' as const,
          transaction_type: 'internal_transfer' as const,
          counterparty_type: 'internal_wallet' as const,
          counterparty_name: targetWallet.name,
          counterparty_ref: targetWallet.id,
          amount_minor: input.amountMinor,
          currency: sourceWallet.currency,
          payment_note: paymentNote,
          status: 'completed' as const,
          reference,
          completed_at: now,
        },
        {
          account_id: user.account_id,
          wallet_id: targetWallet.id,
          direction: 'incoming' as const,
          transaction_type: 'internal_transfer' as const,
          counterparty_type: 'internal_wallet' as const,
          counterparty_name: sourceWallet.name,
          counterparty_ref: sourceWallet.id,
          amount_minor: receiveAmountMinor,
          currency: targetWallet.currency,
          payment_note: paymentNote,
          status: 'completed' as const,
          reference,
          completed_at: now,
        },
      ])
      .select(TX_SELECT)

    if (insertResult.error) {
      throw new Error(`Failed to insert transactions: ${insertResult.error.message}`)
    }

    const sourceUpdate = await supabase
      .from('wallets')
      .update({
        balance_minor: sourceWallet.balance_minor - input.amountMinor,
        available_balance_minor: sourceWallet.available_balance_minor - input.amountMinor,
      })
      .eq('id', sourceWallet.id)
      .eq('account_id', user.account_id)

    if (sourceUpdate.error) {
      throw new Error(`Failed to update source wallet: ${sourceUpdate.error.message}`)
    }

    const targetUpdate = await supabase
      .from('wallets')
      .update({
        balance_minor: targetWallet.balance_minor + receiveAmountMinor,
        available_balance_minor: targetWallet.available_balance_minor + receiveAmountMinor,
      })
      .eq('id', targetWallet.id)
      .eq('account_id', user.account_id)

    if (targetUpdate.error) {
      throw new Error(`Failed to update target wallet: ${targetUpdate.error.message}`)
    }

    const response: PaymentSubmitResponse = {
      status: 'completed',
      reference,
      createdTransactions: insertResult.data.map(mapTransaction),
    }

    return Response.json(response, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to submit payment'
    return jsonError(500, 'SUBMIT_FAILED', message)
  }
}
