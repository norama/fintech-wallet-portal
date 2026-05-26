import { queryOptions } from '@tanstack/react-query'

import { fetchOverview } from '@/features/overview/api/overviewClient'

export const overviewQueryKeys = {
  detail: () => ['overview'] as const,
} as const

export function getOverviewQueryOptions() {
  return queryOptions({
    queryKey: overviewQueryKeys.detail(),
    queryFn: fetchOverview,
  })
}
