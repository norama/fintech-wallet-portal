import { askInsight } from '@/features/insights/api/insightsClient'
import { mutationOptions } from '@tanstack/react-query'

export const insightsMutationKeys = {
  ask: () => ['insights', 'ask'] as const,
} as const

export function getAskInsightMutationOptions() {
  return mutationOptions({
    mutationKey: insightsMutationKeys.ask(),
    mutationFn: askInsight,
  })
}
