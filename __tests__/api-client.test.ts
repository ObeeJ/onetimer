import { apiClient } from '@/lib/api-client'

// Mock fetch
global.fetch = jest.fn()

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('login makes correct API call', async () => {
    const mockResponse = { ok: true, data: { token: 'test-token', user: { id: '1' } } }
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse.data)
    })

    const result = await apiClient.login('test@test.com', 'password')
    
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ email: 'test@test.com', password: 'password' })
      })
    )
    expect(result.ok).toBe(true)
  })

  test('getSurveys handles query parameters', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([])
    })

    await apiClient.getSurveys({ category: 'tech', status: 'active' })
    
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/survey?category=tech&status=active'),
      expect.any(Object)
    )
  })

  test('handles API errors correctly', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: 'Unauthorized' })
    })

    const result = await apiClient.getProfile()
    
    expect(result.ok).toBe(false)
    expect(result.error).toBe('Unauthorized')
  })
})