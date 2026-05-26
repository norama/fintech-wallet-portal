import { z } from 'zod'

// TODO: Switch back to z.uuid() after seeded wallet IDs are replaced with RFC-compliant UUIDs.
const uuidLikeSchema = z
  .string()
  .regex(
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    'Must be a valid UUID',
  )

const externalTransferSchema = z.object({
  paymentType: z.literal('external_transfer'),
  sourceWalletId: uuidLikeSchema,
  amountMinor: z.number().int().positive('Amount must be greater than 0'),
  paymentNote: z.string().max(140, 'Payment note must be 140 characters or fewer').optional(),
  recipientName: z.string().optional(),
  recipientAccountRef: z.string().min(1, 'Recipient account reference is required'),
})

const ownWalletTransferSchema = z.object({
  paymentType: z.literal('own_wallet_transfer'),
  sourceWalletId: uuidLikeSchema,
  amountMinor: z.number().int().positive('Amount must be greater than 0'),
  paymentNote: z.string().max(140, 'Payment note must be 140 characters or fewer').optional(),
  targetWalletId: uuidLikeSchema,
})

export const paymentPreviewBodySchema = z.discriminatedUnion('paymentType', [
  externalTransferSchema,
  ownWalletTransferSchema,
])

export type PaymentPreviewBody = z.infer<typeof paymentPreviewBodySchema>
