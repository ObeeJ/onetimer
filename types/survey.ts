export interface Survey {
  id: string
  creator_id: string
  title: string
  description: string
  category: string
  reward_amount: number
  estimated_duration: number
  target_responses: number
  current_responses: number
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'active' | 'completed'
  created_at: string
  updated_at: string
  expires_at?: string
  questions?: Question[]
  // Backward compatibility aliases
  reward?: number // alias for reward_amount
  responses_count?: number // alias for current_responses
  responses?: number // alias for current_responses
  target?: number // alias for target_responses
  expiresAt?: string // alias for expires_at
  eligible?: boolean
}

export interface CreatorSurvey extends Survey {
  // Ensure backward compatibility fields are present
  responses: number
  target: number
  expiresAt: string
}

export interface Question {
  id: string
  survey_id: string
  type: 'single' | 'multi' | 'text' | 'rating' | 'matrix' | 'multiple_choice' | 'open_ended'
  text: string
  options?: string[]
  required?: boolean
  order_num: number
  placeholder?: string
  scale?: number
  rows?: string[]
  cols?: string[]
}

export interface SurveyResponse {
  question_id: string
  answer: string
}
