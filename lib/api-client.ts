import { toast } from '@/hooks/use-toast'

interface ApiResponse<T = any> {
  ok: boolean
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
    this.token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      return { ok: true, data }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      toast({
        title: 'API Error',
        description: errorMessage,
        variant: 'destructive',
      })
      return { ok: false, error: errorMessage }
    }
  }

  // Authentication
  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: any) {
    return this.request<{ user: any }>('/user/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async logout() {
    const result = await this.request('/auth/logout', { method: 'POST' })
    this.clearToken()
    return result
  }

  // User Management
  async getProfile() {
    return this.request<any>('/user/profile')
  }

  async updateProfile(profileData: any) {
    return this.request<any>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  }

  // Surveys
  async getSurveys(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params)}` : ''
    return this.request<any[]>(`/survey${query}`)
  }

  async getSurvey(id: string) {
    return this.request<any>(`/survey/${id}`)
  }

  async createSurvey(surveyData: any) {
    return this.request<any>('/survey', {
      method: 'POST',
      body: JSON.stringify(surveyData),
    })
  }

  async updateSurvey(id: string, surveyData: any) {
    return this.request<any>(`/survey/${id}`, {
      method: 'PUT',
      body: JSON.stringify(surveyData),
    })
  }

  async submitSurveyResponse(surveyId: string, responses: any) {
    return this.request<any>(`/survey/${surveyId}/submit`, {
      method: 'POST',
      body: JSON.stringify(responses),
    })
  }

  // Earnings
  async getEarnings() {
    return this.request<any>('/earnings')
  }

  async requestWithdrawal(withdrawalData: any) {
    return this.request<any>('/withdrawal/request', {
      method: 'POST',
      body: JSON.stringify(withdrawalData),
    })
  }

  // Admin Functions
  async getUsers(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params)}` : ''
    return this.request<any[]>(`/admin/users${query}`)
  }

  async approveUser(userId: string) {
    return this.request<any>(`/admin/users/${userId}/approve`, {
      method: 'POST',
    })
  }

  async rejectUser(userId: string, reason: string) {
    return this.request<any>(`/admin/users/${userId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }

  async approveSurvey(surveyId: string) {
    return this.request<any>(`/admin/surveys/${surveyId}/approve`, {
      method: 'POST',
    })
  }

  // Creator Functions
  async getCreatorDashboard() {
    return this.request<any>('/creator/dashboard')
  }

  async getMySurveys() {
    return this.request<any[]>('/creator/surveys')
  }

  async getSurveyAnalytics(surveyId: string) {
    return this.request<any>(`/creator/surveys/${surveyId}/analytics`)
  }

  async exportSurveyResponses(surveyId: string, format: 'csv' | 'json' = 'csv') {
    return this.request<any>(`/creator/surveys/${surveyId}/export?format=${format}`)
  }

  // Credits
  async getCredits() {
    return this.request<any>('/creator/credits')
  }

  async purchaseCredits(amount: number) {
    return this.request<any>('/credits/purchase', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    })
  }

  // Referrals
  async getReferrals() {
    return this.request<any>('/referral')
  }

  async generateReferralCode() {
    return this.request<any>('/referral/code', {
      method: 'POST',
    })
  }

  // Super Admin Functions
  async getAdmins() {
    return this.request<any[]>('/super-admin/admins')
  }

  async createAdmin(adminData: any) {
    return this.request<any>('/super-admin/admins', {
      method: 'POST',
      body: JSON.stringify(adminData),
    })
  }

  async getFinancials() {
    return this.request<any>('/super-admin/financials')
  }

  async getAuditLogs() {
    return this.request<any[]>('/super-admin/audit-logs')
  }

  // File Upload
  async uploadFile(file: File, type: 'kyc' | 'survey-media' | 'response-image') {
    const formData = new FormData()
    formData.append('file', file)

    const headers: HeadersInit = {}
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(`${this.baseURL}/upload/${type}`, {
        method: 'POST',
        headers,
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      return { ok: true, data }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload error'
      toast({
        title: 'Upload Error',
        description: errorMessage,
        variant: 'destructive',
      })
      return { ok: false, error: errorMessage }
    }
  }

  // Notifications
  async getNotifications() {
    return this.request<any[]>('/notifications')
  }

  async markNotificationRead(notificationId: string) {
    return this.request<any>(`/notifications/${notificationId}/read`, {
      method: 'POST',
    })
  }

  // Billing
  async calculateSurveyCost(billingData: any) {
    return this.request<any>('/billing/calculate', {
      method: 'POST',
      body: JSON.stringify(billingData),
    })
  }

  async validateReward(pages: number, rewardPerUser: number) {
    return this.request<any>('/billing/validate-reward', {
      method: 'POST',
      body: JSON.stringify({ pages, reward_per_user: rewardPerUser }),
    })
  }

  async getPricingTiers() {
    return this.request<any>('/billing/pricing-tiers')
  }

  // Authentication (OTP)
  async sendOTP(email: string) {
    return this.request<any>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  async verifyOTP(email: string, otp: string) {
    return this.request<any>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    })
  }

  // Survey Management
  async getSurveyQuestions(surveyId: string) {
    return this.request<any>(`/survey/${surveyId}/questions`)
  }

  async startSurvey(surveyId: string) {
    return this.request<any>(`/survey/${surveyId}/start`, {
      method: 'POST',
    })
  }

  async saveProgress(surveyId: string, progress: number, answers: any) {
    return this.request<any>(`/survey/${surveyId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ progress, answers }),
    })
  }

  async getSurveyTemplates() {
    return this.request<any>('/survey/templates')
  }

  async saveSurveyDraft(surveyData: any) {
    return this.request<any>('/survey/draft', {
      method: 'POST',
      body: JSON.stringify(surveyData),
    })
  }

  // Withdrawal
  async getBanks() {
    return this.request<any>('/withdrawal/banks')
  }

  async verifyAccount(accountNumber: string, bankCode: string) {
    return this.request<any>('/withdrawal/verify-account', {
      method: 'POST',
      body: JSON.stringify({ account_number: accountNumber, bank_code: bankCode }),
    })
  }

  async getWithdrawalHistory() {
    return this.request<any>('/withdrawal/history')
  }

  // Credits
  async getCreditPackages() {
    return this.request<any>('/credits/packages')
  }

  // Eligibility
  async checkEligibility() {
    return this.request<any>('/eligibility/check')
  }

  // Onboarding
  async completeFillerOnboarding(data: any) {
    return this.request<any>('/onboarding/filler', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateDemographics(data: any) {
    return this.request<any>('/onboarding/demographics', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async getEligibleSurveys() {
    return this.request<any>('/onboarding/surveys')
  }
}

export const apiClient = new ApiClient()
export default apiClient