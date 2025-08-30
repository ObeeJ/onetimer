"use client"

import { useState, useEffect } from "react"

interface AdminUser {
  id: string
  name: string
  email: string
  role: "super_admin" | "admin"
}

export function useAdminAuth() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("admin_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const signIn = (email: string, password: string) => {
    // Mock authentication
    const mockUser: AdminUser = {
      id: "admin_1",
      name: "Admin User",
      email,
      role: "super_admin"
    }
    setUser(mockUser)
    setIsAuthenticated(true)
    localStorage.setItem("admin_user", JSON.stringify(mockUser))
    return Promise.resolve(mockUser)
  }

  const signOut = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("admin_user")
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signOut
  }
}