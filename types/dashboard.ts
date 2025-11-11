import { Survey } from './survey'

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

export interface CreditTransaction {
  id: string
  type: 'purchase' | 'usage'
  description: string
  date: string
  credits: number
}

export interface CreatorCredits {
  balance: number
  spent: number
  transactions: CreditTransaction[]
}

export interface PaginatedResponse<T> {
  data: T[]
  hasNextPage: boolean
  page: number
  limit: number
  total: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}