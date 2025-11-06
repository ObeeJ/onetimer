"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './use-api'
import { CreatorSurvey } from '@/types/survey'

export interface CreatorDashboard {
  total_surveys: number
  active_surveys: number
  total_responses: number
  credits_balance: number
  monthly_responses: number
}

export interface SurveyAnalytics {
  survey_id: string
  total_responses: number
  completion_rate: number
  avg_time: string
  demographics: {
    age_groups: Record<string, number>
    gender: Record<string, number>
    education: Record<string, number>
  }
  response_trends: Array<{
    date: string
    responses: number
  }>
}

export function useCreatorDashboard() {
  return useQuery({
    queryKey: ['creator', 'dashboard'],
    queryFn: () => api.get<CreatorDashboard>('/api/creator/dashboard')
  })
}

export function useCreatorSurveys() {
  return useQuery({
    queryKey: ['creator', 'surveys'],
    queryFn: () => api.get<{ surveys: CreatorSurvey[] }>('/api/creator/surveys')
  })
}

export function useCreateSurvey() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (surveyData: any) => api.post('/api/survey', surveyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator', 'surveys'] })
    }
  })
}

export function useUpdateSurvey() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      api.put(`/api/survey/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator', 'surveys'] })
    }
  })
}

export function useDeleteSurvey() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/survey/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator', 'surveys'] })
    }
  })
}

export function useSurveyAnalytics(surveyId: string) {
  return useQuery({
    queryKey: ['creator', 'analytics', surveyId],
    queryFn: () => api.get<SurveyAnalytics>(`/api/creator/surveys/${surveyId}/analytics`),
    enabled: !!surveyId
  })
}

export interface CreditTransaction {
  id: string;
  type: 'purchase' | 'usage';
  description: string;
  date: string;
  credits: number;
}

export interface CreatorCredits {
  balance: number;
  spent: number;
  transactions: CreditTransaction[];
}

export function useCreatorCredits() {
  return useQuery({
    queryKey: ['creator', 'credits'],
    queryFn: () => api.get<CreatorCredits>('/api/creator/credits')
  })
}