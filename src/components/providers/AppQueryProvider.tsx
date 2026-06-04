'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

import { InsightsWidget } from '@/features/insights/components/InsightsWidget'
import { NavigationGuardProvider } from '@/lib/navigation/NavigationGuardContext'

type AppQueryProviderProps = {
  children: ReactNode
}

export function AppQueryProvider({ children }: AppQueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: false,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationGuardProvider>{children}</NavigationGuardProvider>
      <InsightsWidget />
    </QueryClientProvider>
  )
}
