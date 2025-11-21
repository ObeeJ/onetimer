export interface User {
  id: string
  name: string
  email: string
  phone?: string
  dateOfBirth?: string
  gender?: string
  location?: string
  role: "filler" | "creator" | "admin" | "super_admin"
  isVerified: boolean
  isActive: boolean
  kycStatus: "pending" | "approved" | "rejected"
  profilePictureUrl?: string
  // Admin-specific fields
  department?: string
  permissions?: string[]
  createdAt: string
  updatedAt: string
  // KYC data (collected via verification process)
  nin?: string
  bvn?: string
}

export interface Creator extends User {
  organizationType: 'business' | 'research' | 'education' | 'individual'
  organizationName?: string
  credits: number
  totalSurveys: number
}

export interface Admin extends User {
  department: string
  permissions: string[]
}

export interface SuperAdmin extends User {
  // Super admin has all permissions by default
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
