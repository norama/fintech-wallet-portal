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
})

export type WalletListQuery = z.infer<typeof walletListQuerySchema>
