import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from './use-api'

interface UserDetail {
  id: string
  email: string
  name: string
  role: string
  is_active: boolean
  is_verified: boolean
  kyc_status: string
  created_at: string
  last_login: string
  total_earnings: number
  surveys_completed: number
}

export function useUserDetail(userId: string) {
  const api = useApi()
  
  return useQuery({
    queryKey: ['admin', 'users', userId],
    queryFn: () => api.get<UserDetail>(`/admin/users/${userId}`),
    enabled: !!userId
  })
}

export function useSuspendUser() {
  const api = useApi()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      api.post(`/admin/users/${userId}/suspend`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    }
  })
}

export function useActivateUser() {
  const api = useApi()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (userId: string) => api.post(`/admin/users/${userId}/activate`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    }
  })
}

export function useBulkUserActions() {
  const api = useApi()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ userIds, action, reason }: { 
      userIds: string[]; 
      action: 'approve' | 'reject' | 'suspend' | 'activate';
      reason?: string;
    }) => api.post('/admin/users/bulk', { user_ids: userIds, action, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    }
  })
}

export function useExportUsers() {
  const api = useApi()
  
  return useMutation({
    mutationFn: (format: 'csv' | 'xlsx' = 'csv') => 
      api.get(`/admin/export/users?format=${format}`),
  })
}
