export interface User {
  id: string
  name: string
  email: string
  phone?: string
  nin?: string
  bvn?: string
  avatarUrl?: string
  role: "filler" | "creator" | "admin" | "super_admin"
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface Creator extends User {
  organizationType: 'business' | 'research' | 'education' | 'individual'
  organizationName?: string
  credits: number
  totalSurveys: number
}

export interface Admin extends User {
  department?: string
  permissions: string[]
}

export interface Filler extends User {
  profile: FillerProfile
}

export interface FillerProfile {
  age_range: string
  gender: string
  country: string
  state: string
  education: string
  employment: string
  income_range: string
  interests: string[]
}
