import { useQuery } from '@tanstack/react-query'
import { useApi } from './use-api'
import { useState, useMemo } from 'react'

interface SearchFilters {
  query?: string
  category?: string
  status?: string
  minReward?: number
  maxReward?: number
}

export function useSearchSurveys(filters: SearchFilters = {}) {
  const api = useApi()
  
  const queryParams = useMemo(() => {
    const params = new URLSearchParams()
    if (filters.query) params.set('q', filters.query)
    if (filters.category) params.set('category', filters.category)
    if (filters.status) params.set('status', filters.status)
    if (filters.minReward) params.set('min_reward', filters.minReward.toString())
    if (filters.maxReward) params.set('max_reward', filters.maxReward.toString())
    return params.toString()
  }, [filters])
  
  return useQuery({
    queryKey: ['surveys', 'search', queryParams],
    queryFn: () => api.get(`/survey/?${queryParams}`),
    enabled: Object.keys(filters).length > 0
  })
}

export function useSearchFilters() {
  const [filters, setFilters] = useState<SearchFilters>({})
  
  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }
  
  const clearFilters = () => {
    setFilters({})
  }
  
  return {
    filters,
    updateFilter,
    clearFilters,
    hasFilters: Object.keys(filters).length > 0
  }
}
