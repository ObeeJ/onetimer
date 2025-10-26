"use client"

import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './use-api'
import type { Survey, SurveyResponse } from '@/types/survey'

const fetchSurveys = async ({ pageParam = 1 }) => {
  const res = await api.get(`/api/survey?page=${pageParam}&limit=10`)
  return res.data
}

export function useSurveys() {
  return useInfiniteQuery({
    queryKey: ['surveys'],
    queryFn: fetchSurveys,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasNextPage ? pages.length + 1 : undefined
    },
  })
}

export function useSurvey(id: string) {
  return useQuery({
    queryKey: ['survey', id],
    queryFn: () => api.get<Survey>(`/api/v1/surveys/${id}`),
    enabled: !!id
  })
}

export function useSubmitSurvey() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ surveyId, responses }: { surveyId: string, responses: SurveyResponse[] }) =>
      api.post(`/api/v1/surveys/${surveyId}/submit`, { responses }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] })
      queryClient.invalidateQueries({ queryKey: ['earnings'] })
    }
  })
}

export function useSaveProgress() {
  return useMutation({
    mutationFn: ({ surveyId, responses }: { surveyId: string, responses: SurveyResponse[] }) =>
      api.post(`/api/survey/${surveyId}/progress`, { responses }),
  })
}

export function useEligibleSurveys() {
  return useInfiniteQuery({
    queryKey: ['surveys', 'eligible'],
    queryFn: fetchSurveys, // Assuming the same endpoint and pagination
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasNextPage ? pages.length + 1 : undefined
    },
  })
}