"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@/types/user"
import { api } from "@/hooks/use-api"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isVerified: boolean
  signIn: (email: string, password: string) => Promise<User>
  signOut: () => Promise<void>
  isLoading: boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  const refreshUser = async () => {
    try {
      const response = await api.get<{ user: User }>('/api/v1/users/profile')
      setUser(response.user)
    } catch {
      setUser(null)
    }
  }

  useEffect(() => {
    setIsMounted(true)
    refreshUser().finally(() => setIsLoading(false))
  }, [])

  if (!isMounted) {
    return (
      <AuthContext.Provider
        value={{
          user: null,
          isAuthenticated: false,
          isVerified: false,
          signIn: async () => ({} as User),
          signOut: async () => {},
          isLoading: true,
          refreshUser: async () => {}
        }}
      >
        {children}
      </AuthContext.Provider>
    )
  }

  const signIn = async (email: string, password: string): Promise<User> => {
    const response = await api.post<{ user: User }>('/api/v1/auth/login', { email, password })
    setUser(response.user)
    return response.user
  }

  const signOut = async () => {
    try {
      await api.post('/api/v1/auth/logout')
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isVerified: user?.isVerified || false,
        signIn,
        signOut,
        isLoading,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}