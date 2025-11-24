"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@/types/user"
import { apiClient } from "@/lib/api-client"
import { logger } from "@/lib/logger"
import { toast } from "sonner"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isVerified: boolean
  isKycVerified: boolean
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
      const response = await apiClient.getProfile()
      if (response.ok && response.data) {
        // Backend returns { user: {...} }, extract the user object
        const userData = (response.data as any).user || response.data
        setUser(userData as User)
      } else {
        setUser(null)
      }
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
          isKycVerified: false,
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
    logger.logUserAction('sign_in_attempt', { email, timestamp: new Date().toISOString() })

    try {
      const response = await apiClient.login(email, password)
      if (!response.ok || !response.data) {
        throw new Error(response.error || 'Login failed')
      }

      const userData = (response.data as Record<string, unknown>).user as User
      setUser(userData)

      logger.logUserAction('sign_in_success', {
        userId: userData.id,
        role: userData.role,
        email: userData.email,
        timestamp: new Date().toISOString()
      })

      return userData
    } catch (error) {
      logger.error('Sign in failed', error as Error, { email, timestamp: new Date().toISOString() })
      throw error
    }
  }

  const signOut = async () => {
    const userId = user?.id

    logger.logUserAction('sign_out_attempt', { userId, timestamp: new Date().toISOString() })

    try {
      await apiClient.logout()
      logger.logUserAction('sign_out_success', { userId, timestamp: new Date().toISOString() })
      
      toast.success("Signed out successfully", {
        description: "You've been securely logged out of your account"
      })
    } catch (error) {
      logger.error('Sign out failed', error as Error, { userId, timestamp: new Date().toISOString() })
      
      toast.error("Sign out failed", {
        description: "There was an issue signing you out. Please try again"
      })
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
        isKycVerified: user?.kycStatus === "approved",
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