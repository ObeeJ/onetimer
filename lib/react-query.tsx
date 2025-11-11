"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createApiError, getErrorMessage } from './error-handler'
import { toast } from '@/hooks/use-toast'

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

        // Show error toast for failed queries (but not auth errors)
        onError: (error: unknown) => {
          const apiError = createApiError(error)

          // Don't show toast for auth errors - let components handle
          if ([401, 403].includes(apiError.status)) {
            return
          }

          const message = getErrorMessage(apiError)
          toast({
            title: 'Failed to load data',
            description: message,
            variant: 'destructive'
          })
        }
      },

      mutations: {
        retry: 1, // Retry mutations once on failure

        onError: (error: unknown) => {
          const apiError = createApiError(error)
          const message = getErrorMessage(apiError)

          if (apiError.status === 401) {
            /*
             * IMPORTANT: With httpOnly cookies, no manual token cleanup needed!
             *
             * When 401 occurs:
             * 1. Backend clears httpOnly cookie automatically
             * 2. Browser handles cookie removal (not accessible to JS)
             * 3. Next request will not include the cookie
             * 4. User must sign in again
             *
             * We only show the toast - navigation handled by useQueryErrorHandler hook
             */
            toast({
              title: 'Session expired',
              description: 'Please sign in again',
              variant: 'destructive'
            })
          } else {
            toast({
              title: 'Operation failed',
              description: message,
              variant: 'destructive'
            })
          }
        }
      }
    }
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}