"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { createApiError } from './error-handler'

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  // Router is obtained in the hooks, not at provider level
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 5 minutes
        staleTime: 5 * 60 * 1000,
        // Keep data in cache for 10 minutes before garbage collection
        gcTime: 10 * 60 * 1000,

        retry: (failureCount, error: unknown) => {
          const apiError = createApiError(error)
          // Don't retry on auth/permission/not found errors
          if ([401, 403, 404].includes(apiError.status)) return false
          // Retry network errors up to 3 times with exponential backoff
          return failureCount < 3
        },

        // Let errors bubble up to components for custom handling
        throwOnError: true,
      },

      mutations: {
        retry: 1, // Retry mutations once on failure
      }
    }
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}