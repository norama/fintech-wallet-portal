'use client'

import { getAskInsightMutationOptions } from '@/lib/query/insightsQuery'
import { useMutation } from '@tanstack/react-query'

export function useAskInsight() {
  return useMutation(getAskInsightMutationOptions())
}
