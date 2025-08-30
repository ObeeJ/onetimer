export interface User {
  id: string
  name: string
  email?: string
  phone?: string
  nin?: string
  bvn?: string
  avatarUrl?: string
  role?: "filler" | "creator" | "admin" | "super_admin"
  isVerified?: boolean
}
