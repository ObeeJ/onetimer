import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from './use-api'

interface PaymentMethod {
  id: string
  type: 'bank' | 'mobile_money' | 'crypto'
  name: string
  details: Record<string, any>
  is_default: boolean
  created_at: string
}

interface Transaction {
  id: string
  type: 'earning' | 'withdrawal' | 'bonus'
  amount: number
  status: 'pending' | 'completed' | 'failed'
  description: string
  created_at: string
}

interface Bank {
  code: string
  name: string
  country: string
}

export function usePaymentMethods() {
  const api = useApi()
  
  return useQuery({
    queryKey: ['payment', 'methods'],
    queryFn: () => api.get<{ methods: PaymentMethod[] }>('/payment/methods')
  })
}

export function useTransactionHistory() {
  const api = useApi()
  
  return useQuery({
    queryKey: ['payment', 'history'],
    queryFn: () => api.get<{ transactions: Transaction[] }>('/payment/history')
  })
}

export function useWithdrawalHistory() {
  const api = useApi()
  
  return useQuery({
    queryKey: ['withdrawal', 'history'],
    queryFn: () => api.get<{ withdrawals: Transaction[] }>('/withdrawal/history')
  })
}

export function useBanks() {
  const api = useApi()
  
  return useQuery({
    queryKey: ['withdrawal', 'banks'],
    queryFn: () => api.get<{ banks: Bank[] }>('/withdrawal/banks')
  })
}

export function useAddPaymentMethod() {
  const api = useApi()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (method: Omit<PaymentMethod, 'id' | 'created_at'>) =>
      api.post('/payment/methods', method),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment', 'methods'] })
    }
  })
}
