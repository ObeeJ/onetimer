// Hooks specifically for filler/user-side functionality
import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'

// User authentication hook
export function useUserAuth() {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing auth token
    const token = localStorage.getItem('userToken')
    if (token) {
      setIsAuthenticated(true)
      // Optionally fetch user profile
      fetchUserProfile()
    }
    setLoading(false)
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await api.user.profile.get()
      if (response.success) {
        setUser(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
    }
  }

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await api.user.auth.login(credentials)
      if (response.success) {
        localStorage.setItem('userToken', response.data.token)
        setUser(response.data.user)
        setIsAuthenticated(true)
        return { success: true }
      }
      return { success: false, error: response.error }
    } catch (error) {
      return { success: false, error: 'Login failed' }
    }
  }

  const logout = async () => {
    try {
      await api.user.auth.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('userToken')
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  const register = async (userData: any) => {
    try {
      const response = await api.user.auth.register(userData)
      return response
    } catch (error) {
      return { success: false, error: 'Registration failed' }
    }
  }

  const sendOTP = async (phone: string) => {
    try {
      const response = await api.user.auth.sendOTP(phone)
      return response
    } catch (error) {
      return { success: false, error: 'Failed to send OTP' }
    }
  }

  const verifyOTP = async (phone: string, otp: string) => {
    try {
      const response = await api.user.auth.verifyOTP(phone, otp)
      if (response.success) {
        setUser(response.data.user)
        setIsAuthenticated(true)
      }
      return response
    } catch (error) {
      return { success: false, error: 'OTP verification failed' }
    }
  }

  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
    sendOTP,
    verifyOTP,
    fetchUserProfile
  }
}

// Available surveys hook
export function useAvailableSurveys() {
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSurveys = async () => {
    try {
      setLoading(true)
      const response = await api.user.surveys.getAvailable()
      if (response.success) {
        setSurveys(response.data)
        setError(null)
      } else {
        setError(response.error)
      }
    } catch (err) {
      setError('Failed to fetch surveys')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSurveys()
  }, [])

  const checkEligibility = async (surveyId: string) => {
    try {
      const response = await api.user.surveys.checkEligibility(surveyId)
      return response
    } catch (error) {
      return { success: false, error: 'Failed to check eligibility' }
    }
  }

  return {
    surveys,
    loading,
    error,
    refetch: fetchSurveys,
    checkEligibility
  }
}

// User earnings hook
export function useUserEarnings() {
  const [earnings, setEarnings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEarnings = async () => {
    try {
      setLoading(true)
      const response = await api.user.earnings.get()
      if (response.success) {
        setEarnings(response.data)
        setError(null)
      } else {
        setError(response.error)
      }
    } catch (err) {
      setError('Failed to fetch earnings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEarnings()
  }, [])

  const requestWithdrawal = async (amount: number, bankDetails: any) => {
    try {
      const response = await api.user.earnings.requestWithdrawal(amount, bankDetails)
      if (response.success) {
        // Refresh earnings after successful withdrawal
        fetchEarnings()
      }
      return response
    } catch (error) {
      return { success: false, error: 'Withdrawal request failed' }
    }
  }

  const getWithdrawalMethods = async () => {
    try {
      const response = await api.user.earnings.getWithdrawalMethods()
      return response
    } catch (error) {
      return { success: false, error: 'Failed to fetch withdrawal methods' }
    }
  }

  return {
    earnings,
    loading,
    error,
    refetch: fetchEarnings,
    requestWithdrawal,
    getWithdrawalMethods
  }
}

// User dashboard hook
export function useUserDashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await api.user.dashboard.getStats()
      if (response.success) {
        setDashboardData(response.data)
        setError(null)
      } else {
        setError(response.error)
      }
    } catch (err) {
      setError('Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return {
    dashboardData,
    loading,
    error,
    refetch: fetchDashboardData
  }
}

// User referrals hook
export function useUserReferrals() {
  const [referrals, setReferrals] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchReferrals = async () => {
    try {
      setLoading(true)
      const response = await api.user.referrals.get()
      if (response.success) {
        setReferrals(response.data)
        setError(null)
      } else {
        setError(response.error)
      }
    } catch (err) {
      setError('Failed to fetch referrals')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReferrals()
  }, [])

  const generateReferralCode = async () => {
    try {
      const response = await api.user.referrals.generate()
      if (response.success) {
        // Refresh referrals after generating new code
        fetchReferrals()
      }
      return response
    } catch (error) {
      return { success: false, error: 'Failed to generate referral code' }
    }
  }

  return {
    referrals,
    loading,
    error,
    refetch: fetchReferrals,
    generateReferralCode
  }
}

// Survey taking hook
export function useSurveyTaking() {
  const [currentSurvey, setCurrentSurvey] = useState(null)
  const [responses, setResponses] = useState({})
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(false)

  const startSurvey = async (surveyId: string) => {
    try {
      setLoading(true)
      const response = await api.user.surveys.takeSurvey(surveyId)
      if (response.success) {
        setCurrentSurvey(response.data)
        setResponses({})
        setProgress(0)
      }
      return response
    } catch (error) {
      return { success: false, error: 'Failed to start survey' }
    } finally {
      setLoading(false)
    }
  }

  const updateResponse = (questionId: string, answer: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: answer
    }))
    
    // Calculate progress
    if (currentSurvey?.questions) {
      const completedQuestions = Object.keys(responses).length + 1
      const totalQuestions = currentSurvey.questions.length
      setProgress((completedQuestions / totalQuestions) * 100)
    }
  }

  const submitSurvey = async (surveyId: string) => {
    try {
      setLoading(true)
      const response = await api.user.surveys.submitResponse(surveyId, {
        responses,
        completedAt: new Date().toISOString()
      })
      
      if (response.success) {
        setCurrentSurvey(null)
        setResponses({})
        setProgress(0)
      }
      
      return response
    } catch (error) {
      return { success: false, error: 'Failed to submit survey' }
    } finally {
      setLoading(false)
    }
  }

  return {
    currentSurvey,
    responses,
    progress,
    loading,
    startSurvey,
    updateResponse,
    submitSurvey
  }
}
