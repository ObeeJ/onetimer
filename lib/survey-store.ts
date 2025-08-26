// Simple in-memory data store for surveys
export interface Survey {
  id: string
  title: string
  description: string
  questions: Question[]
  maxResponses: number
  reward: number
  estimatedTime: number
  status: 'draft' | 'live' | 'completed'
  responses: number
  createdAt: Date
  updatedAt: Date
}

export interface Question {
  id: number
  type: 'text' | 'multiple_choice' | 'rating' | 'yes_no' | 'file_upload'
  question: string
  required: boolean
  options?: string[]
  fileTypes?: string[]
  maxFileSize?: number
}

// In-memory survey store
let surveys: Survey[] = [
  {
    id: "survey-1",
    title: "Customer Satisfaction Q4",
    description: "Understanding customer preferences and satisfaction levels for our new product line",
    questions: [
      { 
        id: 1, 
        type: "multiple_choice", 
        question: "How satisfied are you with our service?", 
        required: true, 
        options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"]
      },
      { 
        id: 2, 
        type: "rating", 
        question: "Rate our customer support", 
        required: true
      },
      { 
        id: 3, 
        type: "text", 
        question: "What can we improve?", 
        required: false
      }
    ],
    maxResponses: 500,
    reward: 200,
    estimatedTime: 7,
    status: 'live',
    responses: 45,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: "survey-2",
    title: "Product Feedback Survey",
    description: "Help us improve our products with your valuable feedback",
    questions: [
      { 
        id: 1, 
        type: "text", 
        question: "What do you like most about our product?", 
        required: true
      }
    ],
    maxResponses: 50,
    reward: 150,
    estimatedTime: 3,
    status: 'draft',
    responses: 0,
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: "survey-3",
    title: "User Experience Research",
    description: "Understanding how users interact with our platform",
    questions: [
      { 
        id: 1, 
        type: "rating", 
        question: "How easy is it to navigate our website?", 
        required: true
      },
      { 
        id: 2, 
        type: "yes_no", 
        question: "Would you recommend us to a friend?", 
        required: true
      }
    ],
    maxResponses: 200,
    reward: 100,
    estimatedTime: 5,
    status: 'completed',
    responses: 200,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-25')
  }
]

export const surveyStore = {
  // Get all surveys
  getAll: (): Survey[] => surveys,

  // Get survey by ID
  getById: (id: string): Survey | undefined => {
    return surveys.find(survey => survey.id === id)
  },

  // Update survey
  update: (id: string, updates: Partial<Survey>): Survey | null => {
    const index = surveys.findIndex(survey => survey.id === id)
    if (index === -1) return null
    
    // Auto-approve survey when saved from edit if it has content
    let newStatus = surveys[index].status
    if (updates.title && updates.questions && updates.questions.length > 0) {
      newStatus = 'live' // Auto-launch after editing
    }
    
    surveys[index] = {
      ...surveys[index],
      ...updates,
      status: newStatus,
      updatedAt: new Date()
    }
    return surveys[index]
  },

  // Create new survey
  create: (surveyData: Omit<Survey, 'id' | 'createdAt' | 'updatedAt'>): Survey => {
    const newSurvey: Survey = {
      ...surveyData,
      id: `survey-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    surveys.push(newSurvey)
    return newSurvey
  },

  // Delete survey
  delete: (id: string): boolean => {
    const index = surveys.findIndex(survey => survey.id === id)
    if (index === -1) return false
    
    surveys.splice(index, 1)
    return true
  }
}