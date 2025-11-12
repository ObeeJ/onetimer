"use client"

import { useRouter } from "next/navigation"
import { logger } from "@/lib/logger"

const API_BASE = '/api'

class ApiError extends Error {
  constructor(public status: number, message: string, public data?: Record<string, unknown>) {
    super(message)
    this.name = 'ApiError'
  }
}

// Simple API client that can be imported directly (no React hooks)
const simpleApiClient = {
  get: async <T = unknown>(url: string): Promise<T> => {
    const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`
    const res = await fetch(fullUrl, {
      method: 'GET',
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new ApiError(res.status, (errorData as Record<string, unknown>).message as string || `Request failed: ${res.status}`, errorData)
    }

    return res.json() as Promise<T>
  },

  post: async <T = unknown>(url: string, data?: unknown): Promise<T> => {
    const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`
    const res = await fetch(fullUrl, {
      method: 'POST',
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new ApiError(res.status, (errorData as Record<string, unknown>).message as string || `Request failed: ${res.status}`, errorData)
    }

    return res.json() as Promise<T>
  },

  put: async <T = unknown>(url: string, data?: unknown): Promise<T> => {
    const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`
    const res = await fetch(fullUrl, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new ApiError(res.status, (errorData as Record<string, unknown>).message as string || `Request failed: ${res.status}`, errorData)
    }

    return res.json() as Promise<T>
  },

  delete: async <T = unknown>(url: string): Promise<T> => {
    const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`
    const res = await fetch(fullUrl, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new ApiError(res.status, (errorData as Record<string, unknown>).message as string || `Request failed: ${res.status}`, errorData)
    }

    return res.json() as Promise<T>
  },
}

export const api = simpleApiClient

export function useApi() {
  const router = useRouter()

  const fetchJSON = async <T = unknown>(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<T> => {
    const url = typeof input === 'string' && !input.startsWith('http')
      ? `${API_BASE}${input}`
      : input

    const start = Date.now()
    const method = init?.method || 'GET'

    const res = await fetch(url, {
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...(init?.headers || {})
      },
      ...init,
    })

    const duration = Date.now() - start

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))

      logger.logApiCall(method, url.toString(), res.status, duration)
      logger.error('API Request Failed', undefined, {
        method,
        url: url.toString(),
        status: res.status,
        errorData,
        timestamp: new Date().toISOString()
      })

      if (res.status === 401) {
        router.push('/login')
        return Promise.reject(new ApiError(401, 'Unauthorized'))
      }

      throw new ApiError(res.status, (errorData as Record<string, unknown>).message as string || `Request failed: ${res.status}`, errorData)
    }

    logger.logApiCall(method, url.toString(), res.status, duration)
    return res.json() as Promise<T>
  }

  return {
    get: <T,>(url: string) => fetchJSON<T>(url),
    post: <T,>(url: string, data?: unknown) => fetchJSON<T>(url, { method: 'POST', body: JSON.stringify(data) }),
    put: <T,>(url: string, data?: unknown) => fetchJSON<T>(url, { method: 'PUT', body: JSON.stringify(data) }),
    delete: <T,>(url: string) => fetchJSON<T>(url, { method: 'DELETE' })
  }
}
