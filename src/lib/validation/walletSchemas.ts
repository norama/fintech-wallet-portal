import { z } from 'zod'

export const walletListQuerySchema = z.object({
  search: z
    .string()
    .trim()
    .max(120, { error: 'Search must be 120 characters or fewer' })
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  currency: z.enum(['EUR', 'CZK', 'USD', 'GBP']).optional(),
  status: z.enum(['active', 'limited', 'suspended']).optional(),
  isPrimary: z
    .union([z.literal('true'), z.literal(true)])
    .optional()
    .transform((v) => (v !== undefined ? (true as const) : undefined)),
})

export type WalletListQuery = z.infer<typeof walletListQuerySchema>

export const walletCreateBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: 'Wallet name is required' })
    .max(80, { error: 'Name must be 80 characters or fewer' }),
  currency: z.enum(['EUR', 'CZK', 'USD', 'GBP'], { error: 'Please select a currency' }),
})

export type WalletCreateBody = z.infer<typeof walletCreateBodySchema>
