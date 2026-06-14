'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createWallet } from '@/features/wallets/api/walletsClient'

export function useCreateWallet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createWallet,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['wallets'] })
    },
  })
}
