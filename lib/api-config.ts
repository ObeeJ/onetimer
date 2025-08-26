// API Configuration for Go Backend Integration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout',
      REFRESH: '/api/auth/refresh',
      VERIFY_OTP: '/api/auth/verify-otp',
      SEND_OTP: '/api/auth/send-otp',
    },
    
    // Creator Management
    CREATOR: {
      REGISTER: '/api/creator/register',
      PROFILE: '/api/creator/profile',
      APPROVE: '/api/creator/approve',
      KYC_UPLOAD: '/api/creator/kyc',
    },
    
    // Surveys
    SURVEYS: {
      LIST: '/api/surveys',
      CREATE: '/api/surveys',
      DETAIL: '/api/surveys/{id}',
      UPDATE: '/api/surveys/{id}',
      DELETE: '/api/surveys/{id}',
      SUBMIT: '/api/surveys/{id}/submit',
      ANALYTICS: '/api/surveys/{id}/analytics',
      LAUNCH: '/api/surveys/{id}/launch',
      PAUSE: '/api/surveys/{id}/pause',
    },
    
    // Payments
    PAYMENTS: {
      CREDIT_PACKAGES: '/api/payments/credit-packages',
      PURCHASE_CREDITS: '/api/payments/purchase-credits',
      WITHDRAW: '/api/payments/withdraw',
      BALANCE: '/api/payments/balance',
      TRANSACTIONS: '/api/payments/transactions',
    },
    
    // User Management  
    USERS: {
      PROFILE: '/api/users/profile',
      UPDATE_PROFILE: '/api/users/profile',
      EARNINGS: '/api/users/earnings',
      REFERRALS: '/api/users/referrals',
      GENERATE_REFERRAL: '/api/users/referrals/generate',
      ELIGIBILITY: '/api/users/eligibility',
      DASHBOARD_STATS: '/api/users/dashboard',
    },
    
    // Survey Taking (User/Filler Side)
    USER_SURVEYS: {
      AVAILABLE: '/api/user-surveys/available',
      MY_SURVEYS: '/api/user-surveys/my-surveys',
      TAKE_SURVEY: '/api/user-surveys/{id}/take',
      SUBMIT_RESPONSE: '/api/user-surveys/{id}/submit',
      CHECK_ELIGIBILITY: '/api/user-surveys/{id}/eligibility',
      GET_PROGRESS: '/api/user-surveys/{id}/progress',
    },
    
    // User Authentication
    USER_AUTH: {
      REGISTER: '/api/user-auth/register',
      LOGIN: '/api/user-auth/login',
      LOGOUT: '/api/user-auth/logout',
      VERIFY_PHONE: '/api/user-auth/verify-phone',
      SEND_OTP: '/api/user-auth/send-otp',
      VERIFY_OTP: '/api/user-auth/verify-otp',
      REFRESH_TOKEN: '/api/user-auth/refresh',
    },
    
    // User Payments & Earnings
    USER_PAYMENTS: {
      EARNINGS: '/api/user-payments/earnings',
      WITHDRAW_REQUEST: '/api/user-payments/withdraw',
      WITHDRAWAL_METHODS: '/api/user-payments/withdrawal-methods',
      PAYMENT_HISTORY: '/api/user-payments/history',
      BANK_DETAILS: '/api/user-payments/bank-details',
    },
    
    // Analytics
    ANALYTICS: {
      DASHBOARD: '/api/analytics/dashboard',
      SURVEY_STATS: '/api/analytics/surveys/{id}',
      USER_STATS: '/api/analytics/users',
    }
  },
  
  // Request configuration
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Timeout settings
  TIMEOUT: 30000, // 30 seconds
}

// Helper function to build full URLs
export const buildApiUrl = (endpoint: string, params?: Record<string, string>) => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, value)
    })
  }
  
  return url
}

// Environment-specific configurations
export const ENV_CONFIG = {
  DEVELOPMENT: {
    API_BASE_URL: 'http://localhost:8080',
    ENABLE_MOCKS: true,
    DEBUG_MODE: true,
  },
  PRODUCTION: {
    API_BASE_URL: 'https://api.onetimesurvey.com',
    ENABLE_MOCKS: false,
    DEBUG_MODE: false,
  },
  STAGING: {
    API_BASE_URL: 'https://staging-api.onetimesurvey.com',
    ENABLE_MOCKS: false,
    DEBUG_MODE: true,
  }
}

export const getCurrentEnvConfig = () => {
  const env = process.env.NODE_ENV || 'development'
  const enableMocks = process.env.NEXT_PUBLIC_ENABLE_MOCKS === 'true'
  
  switch (env) {
    case 'production':
      return { ...ENV_CONFIG.PRODUCTION, ENABLE_MOCKS: enableMocks }
    case 'staging':
      return { ...ENV_CONFIG.STAGING, ENABLE_MOCKS: enableMocks }
    default:
      return { ...ENV_CONFIG.DEVELOPMENT, ENABLE_MOCKS: enableMocks || true }
  }
}
