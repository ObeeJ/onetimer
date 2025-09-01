const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''

export function getApiUrl(path: string): string {
  // For relative paths, use them as-is (Next.js will handle routing)
  if (path.startsWith('/api/')) {
    return path
  }
  // For absolute URLs, return as-is
  if (path.startsWith('http')) {
    return path
  }
  // For other paths, prepend API base URL if available
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path
}

export async function fetchJSON<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const url = typeof input === 'string' ? getApiUrl(input) : input
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json() as Promise<T>
}
