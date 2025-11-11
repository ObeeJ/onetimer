"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@/types/user"
import { api } from "@/hooks/use-api"
import { logger } from "@/lib/logger"

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
      const response = await api.get<{ user: User }>('/v1/users/profile')
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
    logger.logUserAction('sign_in_attempt', { email })
    
    try {
      const response = await api.post<{ user: User }>('/v1/auth/login', { email, password })
      setUser(response.user)
      
      logger.logUserAction('sign_in_success', {
        userId: response.user.id,
        role: response.user.role,
        email: response.user.email
      })
      
      return response.user
    } catch (error) {
      logger.error('Sign in failed', error as Error, { email })
      throw error
    }
  }

  const signOut = async () => {
    const userId = user?.id
    
    logger.logUserAction('sign_out_attempt', { userId })
    
    try {
      await api.post('/v1/auth/logout')
      logger.logUserAction('sign_out_success', { userId })
    } catch (error) {
      logger.error('Sign out failed', error as Error, { userId })
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