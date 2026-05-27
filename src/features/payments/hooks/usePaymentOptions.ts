'use client'

import { useQuery } from '@tanstack/react-query'

import { getPaymentOptionsQueryOptions } from '@/lib/query/paymentsQuery'

export function usePaymentOptions() {
  return useQuery(getPaymentOptionsQueryOptions())
}
