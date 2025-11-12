"use client"

import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './use-api'
import { createQueryOptions, createMutationOptions } from '@/lib/react-query-config'

import type { Survey, SurveyResponse } from '@/types/survey'
import type { PaginatedResponse } from '@/types/dashboard'

const fetchSurveys = async ({ pageParam = 1 }: { pageParam?: number }): Promise<PaginatedResponse<Survey>> => {
  const res = await api.get<PaginatedResponse<Survey>>(`/survey?page=${pageParam}&limit=10`)
  return res
}

export function useSurveys() {
  return useInfiniteQuery({
    queryKey: ['surveys'],
    queryFn: fetchSurveys,
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasNextPage ? pages.length + 1 : undefined
    },
    retry: (failureCount, error) => {
      const appError = error as any
      if ([401, 403, 404].includes(appError.status)) {
        return false
      }
      return failureCount < 3
    },
    throwOnError: true,
  })
}

export function useSurvey(id: string) {
  return useQuery(
    createQueryOptions({
      queryKey: ['survey', id],
      queryFn: () => api.get<Survey>(`/survey/${id}`),
      enabled: !!id
    })
  )
}

export function useSubmitSurvey() {
  const queryClient = useQueryClient()

  return useMutation(
    createMutationOptions({
      mutationFn: ({ surveyId, responses }: { surveyId: string, responses: SurveyResponse[] }) =>
        api.post(`/survey/${surveyId}/submit`, { responses }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['surveys'] })
        queryClient.invalidateQueries({ queryKey: ['earnings'] })
      }
    })
  )
}

export function useSaveProgress() {
  return useMutation(
    createMutationOptions({
      mutationFn: ({ surveyId, responses }: { surveyId: string, responses: SurveyResponse[] }) =>
        api.post(`/survey/${surveyId}/progress`, { responses }),
    })
  )
}

export function useEligibleSurveys() {
  return useInfiniteQuery({
    queryKey: ['surveys', 'eligible'],
    queryFn: fetchSurveys,
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasNextPage ? pages.length + 1 : undefined
    },
    retry: (failureCount, error) => {
      const appError = error as any
      if ([401, 403, 404].includes(appError.status)) {
        return false
      }
      return failureCount < 3
    },
    throwOnError: true,
  })
}