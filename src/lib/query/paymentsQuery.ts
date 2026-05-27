import { mutationOptions, queryOptions } from '@tanstack/react-query'

import {
  fetchPaymentOptions,
  previewPayment,
  submitPayment,
} from '@/features/payments/api/paymentsClient'

export const paymentsQueryKeys = {
  options: () => ['payments', 'options'] as const,
  preview: () => ['payments', 'preview'] as const,
  submit: () => ['payments', 'submit'] as const,
} as const

export function getPaymentOptionsQueryOptions() {
  return queryOptions({
    queryKey: paymentsQueryKeys.options(),
    queryFn: fetchPaymentOptions,
  })
}

export function getPreviewPaymentMutationOptions() {
  return mutationOptions({
    mutationKey: paymentsQueryKeys.preview(),
    mutationFn: previewPayment,
  })
}

export function getSubmitPaymentMutationOptions() {
  return mutationOptions({
    mutationKey: paymentsQueryKeys.submit(),
    mutationFn: submitPayment,
  })
}
