'use client'

import { useMutation } from '@tanstack/react-query'

import { getPreviewPaymentMutationOptions } from '@/lib/query/paymentsQuery'

export function usePreviewPayment() {
  return useMutation(getPreviewPaymentMutationOptions())
}
