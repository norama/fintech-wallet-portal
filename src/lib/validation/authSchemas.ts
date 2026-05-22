import { z } from 'zod'

export const startSignInSchema = z.object({
  email: z.email('Enter a valid email address'),
})

export const verifyCodeSchema = z.object({
  challengeId: z.uuid('Challenge ID must be a valid UUID'),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Verification code must be 6 digits'),
})

export type StartSignInInput = z.infer<typeof startSignInSchema>
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>
