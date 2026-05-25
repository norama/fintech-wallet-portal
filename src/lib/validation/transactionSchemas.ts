import { z } from 'zod'

// TODO: Switch this back to z.uuid() after the seeded wallet IDs are replaced with RFC-compliant UUIDs.
const uuidLikeSchema = z
  .string()
  .regex(
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    'Wallet ID must be a valid UUID',
  )

export const transactionListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(5).max(50).default(10),
  search: z
    .string()
    .trim()
    .max(120, 'Search must be 120 characters or fewer')
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  walletId: uuidLikeSchema.optional(),
  status: z.enum(['completed', 'pending', 'failed', 'reversed', 'requires_review']).optional(),
  direction: z.enum(['incoming', 'outgoing']).optional(),
  transactionType: z
    .enum(['bank_transfer', 'internal_transfer', 'card_payment', 'fee', 'fx_conversion'])
    .optional(),
})

export type TransactionListQuery = z.infer<typeof transactionListQuerySchema>
