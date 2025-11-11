export interface ApiError {
  status: number
  message: string
  code?: string
  data?: Record<string, unknown>
}

interface ErrorResponse {
  response?: {
    status: number
    data?: {
      message?: string
      code?: string
      [key: string]: unknown
    }
    statusText?: string
  }
  message?: string
}

export function createApiError(error: unknown): ApiError {
  const err = error as ErrorResponse

  if (err?.response) {
    return {
      status: err.response.status,
      message: err.response.data?.message || err.message || 'An error occurred',
      code: err.response.data?.code,
      data: err.response.data as Record<string, unknown> | undefined
    }
  }

  return {
    status: 500,
    message: (err as { message?: string }).message || 'Network error',
    code: 'NETWORK_ERROR'
  }
}

export function getErrorMessage(error: ApiError): string {
  switch (error.status) {
    case 400:
      return error.message || 'Invalid request'
    case 401:
      return 'Please sign in to continue'
    case 403:
      return 'You don\'t have permission to perform this action'
    case 404:
      return 'The requested resource was not found'
    case 422:
      return error.message || 'Please check your input and try again'
    case 429:
      return 'Too many requests. Please try again later'
    case 500:
      return 'Server error. Please try again later'
    default:
      return error.message || 'Something went wrong'
  }
}