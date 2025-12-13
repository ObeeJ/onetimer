import { apiClient } from '../api-client'

export interface DashboardStats {
  totalUsers: number
  userChange: string
  activeAdmins: number
  adminChange: string
  totalSurveys: number
  surveyChange: string
  totalRevenue: number
  revenueChange: string
}

export interface SystemHealth {
  metric: string
  value: string
  status: 'healthy' | 'warning' | 'error'
}

export interface Activity {
  admin: string
  action: string
  time: string
  type: 'approval' | 'payout' | 'moderation' | 'config'
}

export interface Alert {
  type: string
  message: string
  severity: 'low' | 'medium' | 'high'
  time: string
}

export const superAdminApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>('/super-admin/dashboard/stats')
    return response.data!
  },

  getSystemHealth: async (): Promise<SystemHealth[]> => {
    const response = await apiClient.get<SystemHealth[]>('/super-admin/system-health')
    return response.data!
  },

  getActivityFeed: async (): Promise<Activity[]> => {
    const response = await apiClient.get<Activity[]>('/super-admin/activity-feed')
    return response.data!
  },

  getCriticalAlerts: async (): Promise<Alert[]> => {
    const response = await apiClient.get<Alert[]>('/super-admin/alerts')
    return response.data!
  },

  getMonthlyAnalytics: async () => {
    const response = await apiClient.get<any>('/super-admin/analytics/monthly')
    return response.data!
  },

  getUserDistribution: async () => {
    const response = await apiClient.get<any>('/super-admin/analytics/user-distribution')
    return response.data!
  },

  getRevenueTrends: async () => {
    const response = await apiClient.get<any>('/super-admin/analytics/revenue-trends')
    return response.data!
  },

  getSurveyStats: async () => {
    const response = await apiClient.get<any>('/super-admin/surveys/stats')
    return response.data!
  },

  getSurveysList: async () => {
    const response = await apiClient.get<any>('/super-admin/surveys/list')
    return response.data!
  },

  getFinancialMetrics: async () => {
    const response = await apiClient.get<any>('/super-admin/financials/metrics')
    return response.data!
  },

  getPayoutQueue: async () => {
    const response = await apiClient.get<any>('/super-admin/financials/payouts')
    return response.data!
  },

  getReconciliation: async () => {
    const response = await apiClient.get<any>('/super-admin/financials/reconciliation')
    return response.data!
  },

  approvePayout: async (payoutId: string) => {
    return await apiClient.post(`/super-admin/financials/approve-payout/${payoutId}`)
  },

  getAllUsers: async () => {
    return await apiClient.get<any>('/super-admin/users')
  },

  getAdmins: async () => {
    const response = await apiClient.get<any[]>('/super-admin/admins')
    return response.data!
  },

  createAdmin: async (data: { email: string; name: string; password: string }) => {
    return await apiClient.post('/super-admin/admins', data)
  },

  suspendAdmin: async (adminId: string, reason: string) => {
    return await apiClient.post(`/super-admin/admins/${adminId}/suspend`, { reason })
  },
}
