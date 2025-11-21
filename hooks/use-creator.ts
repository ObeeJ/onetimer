"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './use-api'
import { createQueryOptions, createMutationOptions } from '@/lib/react-query-config'
import { CreatorSurvey, Survey } from '@/types/survey'
import { CreatorDashboard, SurveyAnalytics, CreatorCredits } from '@/types/dashboard'

export function useCreatorDashboard() {
  return useQuery(
    createQueryOptions({
      queryKey: ['creator', 'dashboard'],
      queryFn: () => api.get<CreatorDashboard>('/creator/dashboard')
    })
  )
}

export function useCreatorSurveys() {
  return useQuery(
    createQueryOptions({
      queryKey: ['creator', 'surveys'],
      queryFn: () => api.get<{ surveys: CreatorSurvey[] }>('/creator/surveys')
    })
  )
}

export function useCreateSurvey() {
  const queryClient = useQueryClient()

  return useMutation(
    createMutationOptions({
      mutationFn: (surveyData: Partial<Survey>) => api.post('/survey', surveyData),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['creator', 'surveys'] })
      }
    })
  )
}

export function useUpdateSurvey() {
  const queryClient = useQueryClient()

  return useMutation(
    createMutationOptions({
      mutationFn: ({ id, data }: { id: string; data: Partial<Survey> }) =>
        api.put(`/survey/${id}`, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['creator', 'surveys'] })
      }
    })
  )
}

export function useDeleteSurvey() {
  const queryClient = useQueryClient()

  return useMutation(
    createMutationOptions({
      mutationFn: (id: string) => api.delete(`/survey/${id}`),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['creator', 'surveys'] })
      }
    })
  )
}

export function useSurveyAnalytics(surveyId: string) {
  return useQuery(
    createQueryOptions({
      queryKey: ['creator', 'analytics', surveyId],
      queryFn: () => api.get<SurveyAnalytics>(`/analytics/creator/surveys/${surveyId}`),
      enabled: !!surveyId
    })
  )
}



export function useCreatorCredits() {
  return useQuery(
    createQueryOptions({
      queryKey: ['creator', 'credits'],
      queryFn: () => api.get<CreatorCredits>('/creator/credits')
    })
  )
}