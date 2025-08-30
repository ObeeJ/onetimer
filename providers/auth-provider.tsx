"use client"

import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  name: string
  email?: string
  phone?: string
  role?: "filler" | "creator" | "admin" | "super_admin"
  isVerified?: boolean
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isVerified: boolean
  signIn: (user: User) => void
  signOut: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    try {
      const stored = localStorage.getItem("onetime_user")
      if (stored) {
        setUser(JSON.parse(stored))
      }
    } catch (error) {
      console.error("Failed to load user from localStorage:", error)
    }
    setIsLoading(false)
  }, [])

  // Prevent hydration mismatch by not rendering auth-dependent content until mounted
  if (!isMounted) {
    return (
      <AuthContext.Provider
        value={{
          user: null,
          isAuthenticated: false,
          isVerified: false,
          signIn: () => {},
          signOut: () => {},
          isLoading: true,
        }}
      >
        {children}
      </AuthContext.Provider>
    )
  }

  const signIn = (userData: User) => {
    setUser(userData)
    localStorage.setItem("onetime_user", JSON.stringify(userData))
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem("onetime_user")
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