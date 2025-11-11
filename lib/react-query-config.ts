import { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query'

interface AppError {
  status: number
  message: string
  data?: Record<string, unknown>
}

export const createQueryOptions = <T,>(
  options: UseQueryOptions<T, AppError>
): UseQueryOptions<T, AppError> => ({
  ...options,
  retry: (failureCount, error) => {
    if ([401, 403, 404].includes(error.status)) {
      return false
    }
    return failureCount < 3
  },
  throwOnError: true,
})

export const createMutationOptions = <TData, TError, TVariables>(
  options: UseMutationOptions<TData, AppError, TVariables>
): UseMutationOptions<TData, AppError, TVariables> => ({
  ...options,
  onError: (error) => {
    switch (error.status) {
      case 401:
        console.error('Session expired:', error)
        /*
         * 401 errors (session expired) are handled at the component level using useMutationErrorHandler hook
         * which has access to useRouter for navigation. DO NOT use window.location here.
         */
        // window.location.href = '/login'
        break
      case 403:
        console.error('Permission denied:', error)
        break
      case 404:
        console.error('Resource not found:', error)
        break
      case 422:
        console.error('Validation error:', error)
        break
      case 500:
        console.error('Server error:', error)
        break
      default:
        console.error('API error:', error)
    }
    options.onError?.(error)
  },
})