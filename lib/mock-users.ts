import type { User } from "@/types/user"

// Mock database of registered users
export const mockUsers: User[] = [
  {
    id: "filler-1",
    name: "John Doe",
    email: "john@example.com",
    role: "filler",
    isVerified: true
  },
  {
    id: "filler-2", 
    name: "Jane Smith",
    email: "jane@example.com",
    role: "filler",
    isVerified: true
  },
  {
    id: "creator-1",
    name: "Mike Johnson",
    email: "mike@example.com", 
    role: "creator",
    isVerified: true
  },
  {
    id: "creator-2",
    name: "Sarah Wilson",
    email: "sarah@example.com",
    role: "creator", 
    isVerified: true
  },
  {
    id: "admin-1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    isVerified: true
  }
]

export function authenticateUser(email: string, password: string): User | null {
  // Simple mock authentication - in real app this would be API call
  const user = mockUsers.find(u => u.email === email)
  if (user && password === "password") {
    return user
  }
  return null
}

export function registerUser(userData: Omit<User, "id"> & { password: string }): User {
  // Generate new user ID
  const newUser: User = {
    id: `${userData.role}-${Date.now()}`,
    name: userData.name,
    email: userData.email,
    role: userData.role,
    isVerified: true
  }
  
  // Add to mock database
  mockUsers.push(newUser)
  
  return newUser
}