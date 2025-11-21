export interface APIError {
  code: string
  message: string
  details?: Record<string, any>
}

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: APIError
}

export class APIErrorHandler {
  static handle(error: any): string {
    if (error?.response?.data?.code) {
      const apiError = error.response.data as APIError
      
      // Handle validation errors
      if (apiError.code === 'VALIDATION_ERROR' && apiError.details?.validation_errors) {
        const validationErrors = apiError.details.validation_errors.errors || []
        return validationErrors.map((err: any) => `${err.field}: ${err.message}`).join(', ')
      }
      
      return apiError.message
    }
    
    return error?.message || 'An unexpected error occurred'
  }
  
  static isValidationError(error: any): boolean {
    return error?.response?.data?.code === 'VALIDATION_ERROR'
  }
  
  static getValidationErrors(error: any): Record<string, string> {
    if (!this.isValidationError(error)) return {}
    
    const errors: Record<string, string> = {}
    const validationErrors = error.response.data.details?.validation_errors?.errors || []
    
    validationErrors.forEach((err: any) => {
      errors[err.field] = err.message
    })
    
    return errors
  }
}
