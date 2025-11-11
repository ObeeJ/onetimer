"use client"

/**
 * Hook to handle API errors in components
 * Used with React Query to properly redirect on 401 errors
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './use-auth'

interface StatusError {
  status: number
  message?: string
}

function isStatusError(error: unknown): error is StatusError {
  return typeof error === 'object' && error !== null && 'status' in error && typeof (error as StatusError).status === 'number'
}

function isUnauthorizedError(error: unknown): boolean {
  if (error instanceof Error && error.message.includes('401')) return true
  if (isStatusError(error) && error.status === 401) return true
  return false
}

export function useQueryErrorHandler(error: unknown, shouldRedirect = false) {
  const router = useRouter()
  const { signOut } = useAuth()

  useEffect(() => {
    if (!error) return

    if (isUnauthorizedError(error) && shouldRedirect) {
      // Clear auth state
      signOut()
      // Redirect to login
      router.push('/auth/login')
    }
  }, [error, shouldRedirect, router, signOut])
}

/**
 * Hook to handle mutation errors specifically
 */
export function useMutationErrorHandler() {
  const router = useRouter()
  const { signOut } = useAuth()

  return {
    handleError: (error: unknown) => {
      if (isUnauthorizedError(error)) {
        signOut()
        router.push('/auth/login')
      }
    }
  }
}
