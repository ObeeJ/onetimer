import { API_CONFIG, buildApiUrl, getCurrentEnvConfig } from './api-config'
import { mockApiClient } from './mock-api'

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  errors?: Record<string, string[]>
}

export interface ApiError {
  status: number
  message: string
  details?: any
}

// Enhanced API client for Go backend communication
export class ApiClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>
  
  constructor() {
    const envConfig = getCurrentEnvConfig()
    this.baseUrl = envConfig.API_BASE_URL
    this.defaultHeaders = {
      ...API_CONFIG.DEFAULT_HEADERS,
    }
  }

  // Set authentication token
  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`
  }

  // Remove authentication token
  clearAuthToken() {
    delete this.defaultHeaders['Authorization']
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    params?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    // Use mock API if enabled
    if (mockApiClient.isEnabled()) {
      try {
        const mockResponse = await mockApiClient.mockRequest(endpoint, options.method || 'GET', options.body)
        return mockResponse as ApiResponse<T>
      } catch (error) {
        console.log('Mock API not available for:', endpoint, 'falling back to real API')
      }
    }

    const url = buildApiUrl(endpoint, params)
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
    }

    try {
      const response = await fetch(url, config)
      
      // Handle different response types
      let responseData: any
      const contentType = response.headers.get('content-type')
      
      if (contentType?.includes('application/json')) {
        responseData = await response.json()
      } else {
        responseData = await response.text()
      }

      if (!response.ok) {
        throw {
          status: response.status,
          message: responseData?.message || `HTTP ${response.status}`,
          details: responseData,
        } as ApiError
      }

      return {
        success: true,
        data: responseData,
        message: responseData?.message,
      }
    } catch (error) {
      console.error('API Request failed:', error)
      
      if (error instanceof TypeError) {
        // Network error
        return {
          success: false,
          error: 'Network error. Please check your connection.',
        }
      }

      if ((error as ApiError).status) {
        // HTTP error
        const apiError = error as ApiError
        return {
          success: false,
          error: apiError.message,
          errors: apiError.details?.errors,
        }
      }

      return {
        success: false,
        error: 'An unexpected error occurred.',
      }
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, params)
  }

  async post<T>(
    endpoint: string, 
    body?: any, 
    params?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      },
      params
    )
  }

  async put<T>(
    endpoint: string, 
    body?: any, 
    params?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
      },
      params
    )
  }

  async patch<T>(
    endpoint: string, 
    body?: any, 
    params?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: 'PATCH',
        body: body ? JSON.stringify(body) : undefined,
      },
      params
    )
  }

  async delete<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' }, params)
  }

  // File upload method
  async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    const headers = { ...this.defaultHeaders }
    delete headers['Content-Type'] // Let browser set it for FormData

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers,
    })
  }
}

// Create singleton instance
export const apiClient = new ApiClient()

// Convenience methods for common operations
export const api = {
  // Authentication
  auth: {
    login: (credentials: { email: string; password: string }) =>
      apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials),
    
    register: (userData: any) =>
      apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData),
    
    sendOTP: (phone: string) =>
      apiClient.post(API_CONFIG.ENDPOINTS.AUTH.SEND_OTP, { phone }),
    
    verifyOTP: (phone: string, otp: string) =>
      apiClient.post(API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP, { phone, otp }),
    
    logout: () =>
      apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT),
  },

  // Creator operations
  creator: {
    register: (creatorData: any) =>
      apiClient.post(API_CONFIG.ENDPOINTS.CREATOR.REGISTER, creatorData),
    
    getProfile: () =>
      apiClient.get(API_CONFIG.ENDPOINTS.CREATOR.PROFILE),
    
    updateProfile: (profileData: any) =>
      apiClient.put(API_CONFIG.ENDPOINTS.CREATOR.PROFILE, profileData),
    
    uploadKYC: (file: File) =>
      apiClient.uploadFile(API_CONFIG.ENDPOINTS.CREATOR.KYC_UPLOAD, file),
  },

  // Survey operations
  surveys: {
    list: () =>
      apiClient.get(API_CONFIG.ENDPOINTS.SURVEYS.LIST),
    
    create: (surveyData: any) =>
      apiClient.post(API_CONFIG.ENDPOINTS.SURVEYS.CREATE, surveyData),
    
    get: (id: string) =>
      apiClient.get(API_CONFIG.ENDPOINTS.SURVEYS.DETAIL, { id }),
    
    update: (id: string, surveyData: any) =>
      apiClient.put(API_CONFIG.ENDPOINTS.SURVEYS.UPDATE, surveyData, { id }),
    
    delete: (id: string) =>
      apiClient.delete(API_CONFIG.ENDPOINTS.SURVEYS.DELETE, { id }),
    
    launch: (id: string) =>
      apiClient.post(API_CONFIG.ENDPOINTS.SURVEYS.LAUNCH, {}, { id }),
    
    pause: (id: string) =>
      apiClient.post(API_CONFIG.ENDPOINTS.SURVEYS.PAUSE, {}, { id }),
    
    getAnalytics: (id: string) =>
      apiClient.get(API_CONFIG.ENDPOINTS.SURVEYS.ANALYTICS, { id }),
  },

  // Payment operations
  payments: {
    getCreditPackages: () =>
      apiClient.get(API_CONFIG.ENDPOINTS.PAYMENTS.CREDIT_PACKAGES),
    
    purchaseCredits: (packageId: string) =>
      apiClient.post(API_CONFIG.ENDPOINTS.PAYMENTS.PURCHASE_CREDITS, { packageId }),
    
    getBalance: () =>
      apiClient.get(API_CONFIG.ENDPOINTS.PAYMENTS.BALANCE),
    
    withdraw: (amount: number, accountDetails: any) =>
      apiClient.post(API_CONFIG.ENDPOINTS.PAYMENTS.WITHDRAW, { amount, accountDetails }),
  },

  // User/Filler specific operations
  user: {
    // Authentication
    auth: {
      register: (userData: any) =>
        apiClient.post(API_CONFIG.ENDPOINTS.USER_AUTH.REGISTER, userData),
      
      login: (credentials: { email: string; password: string }) =>
        apiClient.post(API_CONFIG.ENDPOINTS.USER_AUTH.LOGIN, credentials),
      
      logout: () =>
        apiClient.post(API_CONFIG.ENDPOINTS.USER_AUTH.LOGOUT),
      
      sendOTP: (phone: string) =>
        apiClient.post(API_CONFIG.ENDPOINTS.USER_AUTH.SEND_OTP, { phone }),
      
      verifyOTP: (phone: string, otp: string) =>
        apiClient.post(API_CONFIG.ENDPOINTS.USER_AUTH.VERIFY_OTP, { phone, otp }),
    },

    // Profile Management
    profile: {
      get: () =>
        apiClient.get(API_CONFIG.ENDPOINTS.USERS.PROFILE),
      
      update: (profileData: any) =>
        apiClient.put(API_CONFIG.ENDPOINTS.USERS.UPDATE_PROFILE, profileData),
    },

    // Survey Taking
    surveys: {
      getAvailable: () =>
        apiClient.get(API_CONFIG.ENDPOINTS.USER_SURVEYS.AVAILABLE),
      
      getMySurveys: () =>
        apiClient.get(API_CONFIG.ENDPOINTS.USER_SURVEYS.MY_SURVEYS),
      
      takeSurvey: (id: string) =>
        apiClient.get(API_CONFIG.ENDPOINTS.USER_SURVEYS.TAKE_SURVEY, { id }),
      
      submitResponse: (id: string, responses: any) =>
        apiClient.post(API_CONFIG.ENDPOINTS.USER_SURVEYS.SUBMIT_RESPONSE, responses, { id }),
      
      checkEligibility: (id: string) =>
        apiClient.get(API_CONFIG.ENDPOINTS.USER_SURVEYS.CHECK_ELIGIBILITY, { id }),
      
      getProgress: (id: string) =>
        apiClient.get(API_CONFIG.ENDPOINTS.USER_SURVEYS.GET_PROGRESS, { id }),
    },

    // Earnings & Payments
    earnings: {
      get: () =>
        apiClient.get(API_CONFIG.ENDPOINTS.USERS.EARNINGS),
      
      getHistory: () =>
        apiClient.get(API_CONFIG.ENDPOINTS.USER_PAYMENTS.PAYMENT_HISTORY),
      
      requestWithdrawal: (amount: number, bankDetails: any) =>
        apiClient.post(API_CONFIG.ENDPOINTS.USER_PAYMENTS.WITHDRAW_REQUEST, { amount, bankDetails }),
      
      getWithdrawalMethods: () =>
        apiClient.get(API_CONFIG.ENDPOINTS.USER_PAYMENTS.WITHDRAWAL_METHODS),
      
      updateBankDetails: (bankDetails: any) =>
        apiClient.post(API_CONFIG.ENDPOINTS.USER_PAYMENTS.BANK_DETAILS, bankDetails),
    },

    // Referrals
    referrals: {
      get: () =>
        apiClient.get(API_CONFIG.ENDPOINTS.USERS.REFERRALS),
      
      generate: () =>
        apiClient.post(API_CONFIG.ENDPOINTS.USERS.GENERATE_REFERRAL),
    },

    // Dashboard
    dashboard: {
      getStats: () =>
        apiClient.get(API_CONFIG.ENDPOINTS.USERS.DASHBOARD_STATS),
      
      checkEligibility: () =>
        apiClient.get(API_CONFIG.ENDPOINTS.USERS.ELIGIBILITY),
    },
  },
}

export default apiClient
