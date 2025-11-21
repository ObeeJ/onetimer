import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from './use-api'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  created_at: string
}

export function useNotifications() {
  const api = useApi()
  
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get<{ notifications: Notification[] }>('/notification/'),
    refetchInterval: 30000, // Poll every 30 seconds
  })
}

export function useMarkNotificationRead() {
  const api = useApi()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (notificationIds: string[]) => 
      api.post('/notification/mark-read', { notification_ids: notificationIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
