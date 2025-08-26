export interface CreatorProfile {
  id: string
  companyName: string
  registrationNumber: string
  contactPerson: string
  email: string
  phone?: string
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  paymentSetup: boolean
  credits: number
  createdAt: string
  approvedAt?: string
}

export interface SurveyDemographics {
  ageRange?: {
    min: number
    max: number
  }
  gender?: ('male' | 'female' | 'other')[]
  locations?: string[]
  interests?: string[]
  education?: string[]
  income?: string[]
  occupation?: string[]
}

export interface SurveyQuestion {
  id: string
  type: 'multiple_choice' | 'single_choice' | 'text' | 'textarea' | 'rating' | 'boolean'
  question: string
  required: boolean
  options?: string[]
  ratingScale?: {
    min: number
    max: number
    labels?: string[]
  }
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
  }
  order: number
}

export interface Survey {
  id: string
  creatorId: string
  title: string
  description: string
  category: string
  targetDemographics: SurveyDemographics
  questions: SurveyQuestion[]
  rewardPerCompletion: number
  totalBudget: number
  estimatedTime: number
  maxResponses: number
  status: 'draft' | 'pending_approval' | 'approved' | 'live' | 'paused' | 'completed' | 'rejected'
  createdAt: string
  launchedAt?: string
  completedAt?: string
  rejectionReason?: string
  responses: {
    total: number
    completed: number
    inProgress: number
  }
  analytics: {
    completionRate: number
    avgDuration: number
    demographics: Record<string, any>
  }
}

export interface SurveyResponse {
  id: string
  surveyId: string
  userId: string
  answers: Record<string, any>
  completed: boolean
  startedAt: string
  completedAt?: string
  duration?: number
  demographics: {
    age?: number
    gender?: string
    location?: string
  }
}

export interface PaymentSetup {
  paystackPublicKey: string
  paystackSecretKey: string
  bankAccount?: {
    accountNumber: string
    bankCode: string
    accountName: string
  }
  verified: boolean
}

export interface CreditTransaction {
  id: string
  creatorId: string
  type: 'purchase' | 'spend' | 'refund'
  amount: number
  description: string
  reference?: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
}

export interface AdminNotification {
  id: string
  type: 'creator_signup' | 'survey_approval' | 'payment_verification'
  title: string
  message: string
  data: Record<string, any>
  read: boolean
  createdAt: string
}
