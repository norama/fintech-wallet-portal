import { mutationOptions, queryOptions } from '@tanstack/react-query'

import { getCurrentUser, signOut, startSignIn, verifyCode } from '@/features/auth/api/authClient'

export const authQueryKeys = {
  me: () => ['auth', 'me'] as const,
  startSignIn: () => ['auth', 'start-sign-in'] as const,
  verifyCode: () => ['auth', 'verify-code'] as const,
  signOut: () => ['auth', 'sign-out'] as const,
} as const

export function getCurrentUserQueryOptions() {
  return queryOptions({
    queryKey: authQueryKeys.me(),
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000,
  })
}

export function getStartSignInMutationOptions() {
  return mutationOptions({
    mutationKey: authQueryKeys.startSignIn(),
    mutationFn: startSignIn,
  })
}

export function getVerifyCodeMutationOptions() {
  return mutationOptions({
    mutationKey: authQueryKeys.verifyCode(),
    mutationFn: verifyCode,
  })
}

export function getSignOutMutationOptions() {
  return mutationOptions({
    mutationKey: authQueryKeys.signOut(),
    mutationFn: signOut,
  })
}
