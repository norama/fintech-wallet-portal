import { queryOptions } from '@tanstack/react-query'

import { fetchDashboard } from '@/features/dashboard/api/dashboardClient'

export const dashboardQueryKeys = {
  detail: () => ['dashboard'] as const,
} as const

export function getDashboardQueryOptions() {
  return queryOptions({
    queryKey: dashboardQueryKeys.detail(),
    queryFn: fetchDashboard,
  })
}
