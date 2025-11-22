import { toast } from 'sonner'
import { env } from '@/lib/env'

interface ApiResponse<T = Record<string, unknown>> {
  ok: boolean
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private baseURL: string

  constructor() {
    this.baseURL = env.NEXT_PUBLIC_API_URL

    /*
     * DEPRECATED: Token management via localStorage
     *
     * MIGRATION TO httpOnly COOKIES:
     * The backend now sets httpOnly cookies on successful login.
     * Token is no longer stored in localStorage for security reasons.
     *
     * httpOnly cookies are:
     * - Automatically sent with every request (via credentials: 'include')
     * - Not accessible to JavaScript (XSS protection)
     * - Not stored in localStorage (secure by default)
     *
     * No manual token management needed anymore!
     */
  }

  /*
   * DEPRECATED: setToken() method
   * No longer needed - httpOnly cookies handled by browser/backend
   */
  // setToken(token: string) { }

  /*
   * DEPRECATED: clearToken() method
   * No longer needed - logout endpoint clears httpOnly cookies
   */
  // clearToken() { }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle new standardized error format
        if (data.code && data.message) {
          // New format: { code: "VALIDATION_ERROR", message: "...", details: {...} }
          let errorMessage = data.message
          
          // Handle validation errors specially
          if (data.code === 'VALIDATION_ERROR' && data.details?.validation_errors?.errors) {
            const validationErrors = data.details.validation_errors.errors
            errorMessage = validationErrors.map((err: any) => `${err.field}: ${err.message}`).join(', ')
          }
          
          throw new Error(errorMessage)
        } else {
          // Fallback to old format
          throw new Error(data.error || `HTTP ${response.status}`)
        }
      }

      // Handle new success format: { success: true, data: {...} }
      if (data.success && data.data) {
        return { ok: true, data: data.data }
      }

      // Fallback to old format
      return { ok: true, data }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      
      // Handle 401 errors by redirecting to login
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        return { ok: false, error: 'Authentication required' }
      }
      
      toast.error(errorMessage)
      return { ok: false, error: errorMessage }
    }
  }

  // Authentication
  async login(email: string, password: string) {
    return this.request<{ token: string; user: Record<string, unknown> }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: Record<string, unknown>) {
    return this.request<{ user: Record<string, unknown> }>('/user/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async logout() {
    /*
     * Backend clears httpOnly cookie on successful logout
     * No manual token cleanup needed anymore!
     */
    return this.request('/auth/logout', { method: 'POST' })
  }

  // User Management
  async getProfile() {
    return this.request<Record<string, unknown>>('/user/profile')
  }

  async updateProfile(profileData: Record<string, unknown>) {
    return this.request<Record<string, unknown>>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  }

  // Surveys
  async getSurveys(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params)}` : ''
    return this.request<Record<string, unknown>[]>(`/survey${query}`)
  }

  async getSurvey(id: string) {
    return this.request<Record<string, unknown>>(`/survey/${id}`)
  }

  async createSurvey(surveyData: Record<string, unknown>) {
    return this.request<Record<string, unknown>>('/survey', {
      method: 'POST',
      body: JSON.stringify(surveyData),
    })
  }

  async updateSurvey(id: string, surveyData: Record<string, unknown>) {
    return this.request<Record<string, unknown>>(`/survey/${id}`, {
      method: 'PUT',
      body: JSON.stringify(surveyData),
    })
  }

  async submitSurveyResponse(surveyId: string, responses: Record<string, unknown>) {
    return this.request<Record<string, unknown>>(`/survey/${surveyId}/submit`, {
      method: 'POST',
      body: JSON.stringify(responses),
    })
  }

  // Earnings
  async getEarnings() {
    return this.request<Record<string, unknown>>('/earnings')
  }

  async requestWithdrawal(withdrawalData: Record<string, unknown>) {
    return this.request<Record<string, unknown>>('/withdrawal/request', {
      method: 'POST',
      body: JSON.stringify(withdrawalData),
    })
  }

  // Admin Functions
  async getUsers(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params)}` : ''
    return this.request<Record<string, unknown>[]>(`/admin/users${query}`)
  }

  async approveUser(userId: string) {
    return this.request<Record<string, unknown>>(`/admin/users/${userId}/approve`, {
      method: 'POST',
    })
  }

  async rejectUser(userId: string, reason: string) {
    return this.request<Record<string, unknown>>(`/admin/users/${userId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }

  async approveSurvey(surveyId: string) {
    return this.request<Record<string, unknown>>(`/admin/surveys/${surveyId}/approve`, {
      method: 'POST',
    })
  }

  // Creator Functions
  async getCreatorDashboard() {
    return this.request<Record<string, unknown>>('/creator/dashboard')
  }

  async getMySurveys() {
    return this.request<Record<string, unknown>[]>('/creator/surveys')
  }

  async getSurveyAnalytics(surveyId: string) {
    return this.request<Record<string, unknown>>(`/creator/surveys/${surveyId}/analytics`)
  }

  async exportSurveyResponses(surveyId: string, format: 'csv' | 'json' = 'csv') {
    return this.request<Record<string, unknown>>(`/creator/surveys/${surveyId}/export?format=${format}`)
  }

  // Credits
  async getCredits() {
    return this.request<Record<string, unknown>>('/creator/credits')
  }

  async purchaseCredits(amount: number) {
    return this.request<Record<string, unknown>>('/credits/purchase', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    })
  }

  // Referrals
  async getReferrals() {
    return this.request<Record<string, unknown>>('/referral')
  }

  async generateReferralCode() {
    return this.request<Record<string, unknown>>('/referral/code', {
      method: 'POST',
    })
  }

  // Super Admin Functions
  async getAdmins() {
    return this.request<Record<string, unknown>[]>('/super-admin/admins')
  }

  async createAdmin(adminData: Record<string, unknown>) {
    return this.request<Record<string, unknown>>('/super-admin/admins', {
      method: 'POST',
      body: JSON.stringify(adminData),
    })
  }

  async getFinancials() {
    return this.request<Record<string, unknown>>('/super-admin/financials')
  }

  async getAuditLogs() {
    return this.request<Record<string, unknown>[]>('/super-admin/audit-logs')
  }

  // File Upload
  async uploadFile(file: File, type: 'kyc' | 'survey-media' | 'response-image') {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${this.baseURL}/upload/${type}`, {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include', // httpOnly cookie sent automatically
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      return { ok: true, data }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload error'
      toast.error(errorMessage)
      return { ok: false, error: errorMessage }
    }
  }

  // Notifications
  async getNotifications() {
    return this.request<Record<string, unknown>[]>('/notifications')
  }

  async markNotificationRead(notificationId: string) {
    return this.request<Record<string, unknown>>(`/notifications/${notificationId}/read`, {
      method: 'POST',
    })
  }

  // Billing
  async calculateSurveyCost(billingData: Record<string, unknown>) {
    return this.request<Record<string, unknown>>('/billing/calculate', {
      method: 'POST',
      body: JSON.stringify(billingData),
    })
  }

  async validateReward(pages: number, rewardPerUser: number) {
    return this.request<Record<string, unknown>>('/billing/validate-reward', {
      method: 'POST',
      body: JSON.stringify({ pages, reward_per_user: rewardPerUser }),
    })
  }

  async getPricingTiers() {
    return this.request<Record<string, unknown>>('/billing/pricing-tiers')
  }

  // Authentication (OTP)
  async sendOTP(email: string) {
    return this.request<Record<string, unknown>>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  async verifyOTP(email: string, otp: string) {
    return this.request<Record<string, unknown>>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    })
  }

  // User Preferences
  async getUserPreferences() {
    return this.request<{
      notifications: boolean
      email_updates: boolean
      survey_categories: string[]
    }>('/user/preferences', {
      method: 'GET',
    })
  }

  async updateUserPreferences(preferences: {
    notifications: boolean
    email_updates: boolean
    survey_categories: string[]
  }) {
    return this.request<{ message: string }>('/user/preferences', {
      method: 'POST',
      body: JSON.stringify(preferences),
    })
  }

  // Survey Management
  async getSurveyQuestions(surveyId: string) {
    return this.request<Record<string, unknown>>(`/survey/${surveyId}/questions`)
  }

  async startSurvey(surveyId: string) {
    return this.request<Record<string, unknown>>(`/survey/${surveyId}/start`, {
      method: 'POST',
    })
  }

  async saveProgress(surveyId: string, progress: number, answers: Record<string, unknown>) {
    return this.request<Record<string, unknown>>(`/survey/${surveyId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ progress, answers }),
    })
  }

  async getSurveyTemplates() {
    return this.request<Record<string, unknown>>('/survey/templates')
  }

  async saveSurveyDraft(surveyData: Record<string, unknown>) {
    return this.request<Record<string, unknown>>('/survey/draft', {
      method: 'POST',
      body: JSON.stringify(surveyData),
    })
  }

  // Withdrawal
  async getBanks() {
    return this.request<Record<string, unknown>>('/withdrawal/banks')
  }

  async verifyAccount(accountNumber: string, bankCode: string) {
    return this.request<Record<string, unknown>>('/withdrawal/verify-account', {
      method: 'POST',
      body: JSON.stringify({ account_number: accountNumber, bank_code: bankCode }),
    })
  }

  async getWithdrawalHistory() {
    return this.request<Record<string, unknown>>('/withdrawal/history')
  }

  // Credits
  async getCreditPackages() {
    return this.request<Record<string, unknown>>('/credits/packages')
  }

  // Eligibility
  async checkEligibility() {
    return this.request<Record<string, unknown>>('/eligibility/check')
  }

  // Onboarding
  async completeFillerOnboarding(data: Record<string, unknown>) {
    return this.request<Record<string, unknown>>('/onboarding/filler', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateDemographics(data: Record<string, unknown>) {
    return this.request<Record<string, unknown>>('/onboarding/demographics', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async getEligibleSurveys() {
    return this.request<Record<string, unknown>>('/onboarding/surveys')
  }
}

export const apiClient = new ApiClient()
export default apiClient