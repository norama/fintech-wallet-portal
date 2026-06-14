'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { getSubmitPaymentMutationOptions, paymentsQueryKeys } from '@/lib/query/paymentsQuery'

export function useSubmitPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    ...getSubmitPaymentMutationOptions(),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['transactions'] }),
        queryClient.invalidateQueries({ queryKey: paymentsQueryKeys.options() }),
      ])
    },
  })
}
