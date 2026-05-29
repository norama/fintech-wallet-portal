import { z } from 'zod'

export const contactListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(5).max(50).default(20),
  search: z
    .string()
    .trim()
    .max(120, { error: 'Search must be 120 characters or fewer' })
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
})

export type ContactListQuery = z.infer<typeof contactListQuerySchema>

export const contactCreateBodySchema = z.object({
  email: z
    .email({ error: 'Must be a valid email address' })
    .max(254, { error: 'Email is too long' }),
  nickname: z
    .string()
    .trim()
    .min(1, { error: 'Nickname is required' })
    .max(80, { error: 'Nickname must be 80 characters or fewer' }),
})

export type ContactCreateBody = z.infer<typeof contactCreateBodySchema>
