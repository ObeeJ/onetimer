// Mock data service for frontend development without backend
import { getCurrentEnvConfig } from './api-config'

// Mock user data
export const mockUser = {
  id: "user-1",
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe",
  phoneNumber: "+234 806 123 4567",
  isVerified: true,
  createdAt: new Date().toISOString(),
  earnings: {
    total: 25000,
    pending: 5000,
    withdrawn: 20000
  }
}

export const mockCreator = {
  id: "creator-1",
  email: "creator@example.com",
  companyName: "Demo Research Ltd",
  firstName: "Jane",
  lastName: "Smith",
  phoneNumber: "+234 806 123 4567",
  businessDescription: "Market research company focusing on consumer behavior",
  isApproved: true,
  isVerified: true,
  createdAt: new Date().toISOString(),
  credits: 1500
}

export const mockSurveys = [
  {
    id: "survey-1",
    title: "Consumer Preference Study",
    description: "Understanding consumer preferences in Lagos",
    status: "active",
    responses: 45,
    targetResponses: 100,
    reward: 50, // Naira per response
    estimatedTime: 5, // minutes
    category: "Consumer Research",
    eligibility: {
      ageRange: [18, 45],
      location: ["Lagos", "Abuja"],
      gender: ["male", "female"]
    },
    createdAt: new Date().toISOString(),
    analytics: {
      totalResponses: 45,
      completionRate: 78,
      averageTime: 285,
      demographics: {
        gender: { male: 52, female: 48 },
        age: { "18-25": 30, "26-35": 45, "36-45": 25 }
      }
    }
  },
  {
    id: "survey-2", 
    title: "Banking Services Feedback",
    description: "Share your experience with digital banking",
    status: "active",
    responses: 23,
    targetResponses: 150,
    reward: 75,
    estimatedTime: 8,
    category: "Financial Services",
    eligibility: {
      ageRange: [21, 60],
      location: ["Lagos", "Abuja", "Port Harcourt"],
      hasAccount: true
    },
    createdAt: new Date().toISOString()
  },
  {
    id: "survey-3",
    title: "E-commerce Shopping Habits",
    description: "Tell us about your online shopping preferences",
    status: "active", 
    responses: 67,
    targetResponses: 200,
    reward: 40,
    estimatedTime: 4,
    category: "E-commerce",
    eligibility: {
      ageRange: [16, 55],
      location: ["Any"],
      hasShoppedOnline: true
    },
    createdAt: new Date().toISOString()
  }
]

export const mockUserEarnings = {
  totalEarnings: 3450,
  pendingEarnings: 280,
  completedSurveys: 23,
  averageRating: 4.8,
  monthlyEarnings: [
    { month: "Jan", amount: 450 },
    { month: "Feb", amount: 680 },
    { month: "Mar", amount: 520 },
    { month: "Apr", amount: 750 },
    { month: "May", amount: 890 },
    { month: "Jun", amount: 160 }
  ],
  recentTransactions: [
    { id: "t1", survey: "Consumer Preference Study", amount: 50, date: "2025-08-20", status: "completed" },
    { id: "t2", survey: "Banking Services Feedback", amount: 75, date: "2025-08-19", status: "completed" },
    { id: "t3", survey: "E-commerce Shopping Habits", amount: 40, date: "2025-08-18", status: "pending" }
  ]
}

// Mock API responses
export const mockApiResponses = {
  // User Authentication
  '/api/user-auth/login': () => ({
    success: true,
    data: {
      user: mockUser,
      token: 'mock-user-jwt-token-12345',
      refreshToken: 'mock-user-refresh-token-67890'
    },
    message: 'Login successful'
  }),

  '/api/user-auth/register': () => ({
    success: true,
    data: { id: 'user-new', status: 'pending_verification' },
    message: 'Registration successful. Please verify your phone number.'
  }),

  '/api/user-auth/send-otp': () => ({
    success: true,
    data: { sent: true },
    message: 'OTP sent successfully'
  }),

  '/api/user-auth/verify-otp': () => ({
    success: true,
    data: { verified: true, user: mockUser },
    message: 'Phone number verified successfully'
  }),

  // Creator Authentication & Registration
  '/api/auth/login': () => ({
    success: true,
    data: {
      user: mockUser,
      token: 'mock-jwt-token-12345',
      refreshToken: 'mock-refresh-token-67890'
    },
    message: 'Login successful'
  }),

  '/api/creator/register': () => ({
    success: true,
    data: { id: 'creator-new', status: 'pending' },
    message: 'Creator registration submitted for review'
  }),

  '/api/creator/profile': () => ({
    success: true,
    data: mockCreator
  }),

  // User Profile
  '/api/users/profile': () => ({
    success: true,
    data: mockUser
  }),

  // Surveys for users
  '/api/user-surveys/available': () => ({
    success: true,
    data: mockSurveys.filter(s => s.status === 'active')
  }),

  '/api/user-surveys/my-surveys': () => ({
    success: true,
    data: [
      { ...mockSurveys[0], userStatus: 'completed', completedAt: '2025-08-20' },
      { ...mockSurveys[1], userStatus: 'in_progress', progress: 60 },
    ]
  }),

  // Creator surveys
  '/api/surveys': () => ({
    success: true,
    data: mockSurveys
  }),

  '/api/surveys/survey-1/analytics': () => ({
    success: true,
    data: mockSurveys[0].analytics
  }),

  // User earnings
  '/api/users/earnings': () => ({
    success: true,
    data: mockUserEarnings
  }),

  '/api/users/dashboard': () => ({
    success: true,
    data: {
      availableSurveys: 12,
      completedSurveys: mockUserEarnings.completedSurveys,
      totalEarnings: mockUserEarnings.totalEarnings,
      pendingEarnings: mockUserEarnings.pendingEarnings,
      recentActivity: mockUserEarnings.recentTransactions.slice(0, 3)
    }
  }),

  // Referrals
  '/api/users/referrals': () => ({
    success: true,
    data: {
      totalReferrals: 5,
      activeReferrals: 3,
      referralEarnings: 450,
      referralCode: 'JOHN2025',
      referrals: [
        { name: 'Jane D.', joined: '2025-08-15', earnings: 150, status: 'active' },
        { name: 'Mike O.', joined: '2025-08-10', earnings: 200, status: 'active' },
        { name: 'Sarah K.', joined: '2025-08-05', earnings: 100, status: 'active' }
      ]
    }
  }),

  '/api/users/referrals/generate': () => ({
    success: true,
    data: { 
      referralCode: 'JOHN2025',
      referralLink: 'https://onetimesurvey.com/join?ref=JOHN2025'
    }
  }),

  // Payments
  '/api/payments/credit-packages': () => ({
    success: true,
    data: [
      { id: 'basic', name: 'Basic Package', credits: 100, price: 5000 },
      { id: 'premium', name: 'Premium Package', credits: 500, price: 20000 },
      { id: 'enterprise', name: 'Enterprise Package', credits: 1000, price: 35000 }
    ]
  }),

  '/api/user-payments/withdrawal-methods': () => ({
    success: true,
    data: [
      { id: 'bank_transfer', name: 'Bank Transfer', fee: 0, minAmount: 1000 },
      { id: 'mobile_money', name: 'Mobile Money', fee: 50, minAmount: 500 }
    ]
  }),

  '/api/user-payments/withdraw': () => ({
    success: true,
    data: { 
      withdrawalId: 'wd_' + Date.now(),
      status: 'pending',
      estimatedTime: '1-2 business days'
    },
    message: 'Withdrawal request submitted successfully'
  }),

  // Eligibility check
  '/api/users/eligibility': () => ({
    success: true,
    data: {
      isEligible: true,
      eligibleSurveys: 8,
      requirements: {
        phoneVerified: true,
        profileComplete: true,
        minimumAge: true
      }
    }
  })
}

// Mock API client that returns mock data when enabled
export class MockApiClient {
  private mockEnabled: boolean

  constructor() {
    const envConfig = getCurrentEnvConfig()
    this.mockEnabled = envConfig.ENABLE_MOCKS
  }

  async mockRequest(endpoint: string, method: string = 'GET', body?: any) {
    if (!this.mockEnabled) {
      throw new Error('Mock API is disabled')
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500))

    const mockResponse = mockApiResponses[endpoint as keyof typeof mockApiResponses]
    
    if (mockResponse) {
      return mockResponse()
    }

    // Default mock response
    return {
      success: true,
      data: null,
      message: `Mock response for ${method} ${endpoint}`
    }
  }

  // Check if mocks are enabled
  isEnabled(): boolean {
    return this.mockEnabled
  }
}

export const mockApiClient = new MockApiClient()
