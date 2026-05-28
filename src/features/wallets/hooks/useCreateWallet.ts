'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createWallet } from '@/features/wallets/api/walletsClient'
import { overviewQueryKeys } from '@/lib/query/overviewQuery'

export function useCreateWallet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createWallet,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['wallets'] }),
        queryClient.invalidateQueries({ queryKey: overviewQueryKeys.detail() }),
      ])
    },
  })
}
