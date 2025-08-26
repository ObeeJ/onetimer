import { apiClient } from '@/lib/api-client'
import { mockApiClient } from '@/lib/mock-api'
import { getCurrentEnvConfig } from '@/lib/api-config'

// Enhanced fetch that automatically routes to Go backend or mocks
export async function fetchJSON<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const envConfig = getCurrentEnvConfig()
  
  // If running in the browser and mocks are enabled
  if (typeof window !== "undefined" && envConfig.ENABLE_MOCKS) {
    try {
      const url = typeof input === "string" ? input : String(input)
      if (url.startsWith("/api/")) {
        console.log('🔄 Using mock API for:', url)
        const response = await mockApiClient.mockRequest(url, init?.method || 'GET', init?.body)
        return response.data as T
      }
    } catch (error) {
      console.warn('Mock API failed, falling back to real API:', error)
    }
  }

  // Use real API client for Go backend
  const url = typeof input === "string" ? input : String(input)
  const method = init?.method || 'GET'
  
  try {
    let response
    
    switch (method.toUpperCase()) {
      case 'GET':
        response = await apiClient.get(url)
        break
      case 'POST':
        const postBody = init?.body ? JSON.parse(init.body as string) : undefined
        response = await apiClient.post(url, postBody)
        break
      case 'PUT':
        const putBody = init?.body ? JSON.parse(init.body as string) : undefined
        response = await apiClient.put(url, putBody)
        break
      case 'DELETE':
        response = await apiClient.delete(url)
        break
      default:
        throw new Error(`Unsupported method: ${method}`)
    }

    if (!response.success) {
      throw new Error(response.error || 'API request failed')
    }

    return response.data as T
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

// Utility hooks for common API operations
export function useApiCall() {
  const makeRequest = async <T>(
    endpoint: string, 
    options?: RequestInit
  ): Promise<T> => {
    return fetchJSON<T>(endpoint, options)
  }

  return { makeRequest }
}

// Authentication hook
export function useAuth() {
  const login = async (credentials: { email: string; password: string }) => {
    return fetchJSON('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
  }

  const logout = async () => {
    return fetchJSON('/api/auth/logout', { method: 'POST' })
  }

  return { login, logout }
}

// Survey management hook
export function useSurveys() {
  const getSurveys = async () => {
    return fetchJSON('/api/surveys')
  }

  const createSurvey = async (surveyData: any) => {
    return fetchJSON('/api/surveys', {
      method: 'POST',
      body: JSON.stringify(surveyData)
    })
  }

  const updateSurvey = async (id: string, surveyData: any) => {
    return fetchJSON(`/api/surveys/${id}`, {
      method: 'PUT',
      body: JSON.stringify(surveyData)
    })
  }

  const deleteSurvey = async (id: string) => {
    return fetchJSON(`/api/surveys/${id}`, { method: 'DELETE' })
  }

  return { getSurveys, createSurvey, updateSurvey, deleteSurvey }
}
