"use client"

import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from './use-api'
import { createQueryOptions, createMutationOptions } from '@/lib/react-query-config'

import type { Survey, SurveyResponse } from '@/types/survey'
import type { PaginatedResponse } from '@/types/dashboard'

const fetchSurveys = async ({ pageParam = 1 }: { pageParam?: number }): Promise<PaginatedResponse<Survey>> => {
  const { get } = useApi()
  const res = await get<PaginatedResponse<Survey>>(`/survey?page=${pageParam}&limit=10`)
  return res
}

export function useSurveys() {
  return useInfiniteQuery(
    createQueryOptions({
      queryKey: ['surveys'],
      queryFn: fetchSurveys,
      initialPageParam: 1,
      getNextPageParam: (lastPage, pages) => {
        return lastPage.hasNextPage ? pages.length + 1 : undefined
      },
    })
  )
}

export function useSurvey(id: string) {
  return useQuery(
    createQueryOptions({
      queryKey: ['survey', id],
      queryFn: () => {
        const { get } = useApi()
        return get<Survey>(`/survey/${id}`)
      },
      enabled: !!id
    })
  )
}

export function useSubmitSurvey() {
  const queryClient = useQueryClient()
  
  return useMutation(
    createMutationOptions({
      mutationFn: ({ surveyId, responses }: { surveyId: string, responses: SurveyResponse[] }) => {
        const { post } = useApi()
        return post(`/survey/${surveyId}/submit`, { responses })
      },
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
      mutationFn: ({ surveyId, responses }: { surveyId: string, responses: SurveyResponse[] }) => {
        const { post } = useApi()
        return post(`/survey/${surveyId}/progress`, { responses })
      },
    })
  )
}

export function useEligibleSurveys() {
  return useInfiniteQuery(
    createQueryOptions({
      queryKey: ['surveys', 'eligible'],
      queryFn: fetchSurveys,
      initialPageParam: 1,
      getNextPageParam: (lastPage, pages) => {
        return lastPage.hasNextPage ? pages.length + 1 : undefined
      },
    })
  )
}