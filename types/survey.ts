export interface Survey {
  id: string
  title: string
  description: string
  category: string
  estimated_duration: number
  reward: number
  difficulty?: string
  responses_count?: number
  questions?: Question[]
  status?: 'active' | 'draft' | 'completed'
  created_at?: string
  updated_at?: string
}

export interface Question {
  id: string
  type: 'single' | 'multi' | 'text' | 'rating' | 'matrix'
  text: string
  options?: string[]
  required?: boolean
  placeholder?: string
  scale?: number
  rows?: string[]
  cols?: string[]
}

export interface SurveyResponse {
  question_id: string
  answer: string
}
