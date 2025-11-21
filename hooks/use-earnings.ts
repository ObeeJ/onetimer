"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './use-api'
import { createQueryOptions, createMutationOptions } from '@/lib/react-query-config'
import type { Earnings, WithdrawalRequest } from '@/types/earnings'

export function useEarnings() {
  return useQuery(
    createQueryOptions({
      queryKey: ['earnings'],
      queryFn: () => api.get<Earnings>('/analytics/filler/earnings')  // Fixed endpoint
    })
  )
}

export function useWithdraw() {
  const queryClient = useQueryClient()
  
  return useMutation(
    createMutationOptions({
      mutationFn: (data: WithdrawalRequest) => api.post('/earnings/withdraw', data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['earnings'] })
      }
    })
  )
}