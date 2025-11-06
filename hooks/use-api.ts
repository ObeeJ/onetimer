const API_BASE = '/api'

class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function fetchJSON<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const url = typeof input === 'string' && !input.startsWith('http') 
    ? `${API_BASE}${input}` 
    : input

  const res = await fetch(url, {
    credentials: 'include',
    headers: { 
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...(init?.headers || {}) 
    },
    ...init,
  })
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    
    if (res.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
      return Promise.reject(new ApiError(401, 'Unauthorized'))
    }
    
    throw new ApiError(res.status, errorData.message || `Request failed: ${res.status}`, errorData)
  }
  
  return res.json() as Promise<T>
}

export const api = {
  get: <T>(url: string) => fetchJSON<T>(url),
  post: <T>(url: string, data?: any) => fetchJSON<T>(url, { method: 'POST', body: JSON.stringify(data) }),
  put: <T>(url: string, data?: any) => fetchJSON<T>(url, { method: 'PUT', body: JSON.stringify(data) }),
  delete: <T>(url: string) => fetchJSON<T>(url, { method: 'DELETE' })
}
