"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './use-api'
import type { Earnings, WithdrawalRequest } from '@/types/earnings'

export function useEarnings() {
  return useQuery({
    queryKey: ['earnings'],
    queryFn: () => api.get<Earnings>('/api/v1/earnings')
  })
}

export function useWithdraw() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: WithdrawalRequest) => api.post('/api/v1/payments/withdraw', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['earnings'] })
    }
  })
}