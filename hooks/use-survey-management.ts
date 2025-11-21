import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from './use-api'

interface SurveyResponse {
  id: string
  filler_id: string
  filler_name: string
  submitted_at: string
  responses: Record<string, any>
}

export function useSurveyResponses(surveyId: string) {
  const api = useApi()
  
  return useQuery({
    queryKey: ['creator', 'surveys', surveyId, 'responses'],
    queryFn: () => api.get<{ responses: SurveyResponse[] }>(`/creator/surveys/${surveyId}/responses`),
    enabled: !!surveyId
  })
}

export function usePauseSurvey() {
  const api = useApi()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (surveyId: string) => api.post(`/creator/surveys/${surveyId}/pause`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator', 'surveys'] })
    }
  })
}

export function useResumeSurvey() {
  const api = useApi()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (surveyId: string) => api.post(`/creator/surveys/${surveyId}/resume`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator', 'surveys'] })
    }
  })
}

export function useDuplicateSurvey() {
  const api = useApi()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (surveyId: string) => api.post(`/creator/surveys/${surveyId}/duplicate`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator', 'surveys'] })
    }
  })
}
