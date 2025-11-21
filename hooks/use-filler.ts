import { useQuery } from '@tanstack/react-query'
import { useApi } from './use-api'

interface FillerDashboard {
  total_earnings: number
  pending_earnings: number
  completed_surveys: number
  available_surveys: number
  recent_activity: Array<{
    id: string
    type: string
    description: string
    amount?: number
    created_at: string
  }>
}

interface FillerSurvey {
  id: string
  title: string
  description: string
  reward_amount: number
  estimated_duration: number
  category: string
  status: string
  created_at: string
}

export function useFillerDashboard() {
  const api = useApi()
  
  return useQuery({
    queryKey: ['filler', 'dashboard'],
    queryFn: () => api.get<FillerDashboard>('/filler/dashboard')
  })
}

export function useAvailableSurveys() {
  const api = useApi()
  
  return useQuery({
    queryKey: ['filler', 'surveys', 'available'],
    queryFn: () => api.get<{ surveys: FillerSurvey[] }>('/filler/surveys')
  })
}

export function useCompletedSurveys() {
  const api = useApi()
  
  return useQuery({
    queryKey: ['filler', 'surveys', 'completed'],
    queryFn: () => api.get<{ surveys: FillerSurvey[] }>('/filler/surveys/completed')
  })
}
