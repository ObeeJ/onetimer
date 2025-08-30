"use client"

import { useState, useEffect } from "react"

interface SuperAdminUser {
  id: string
  name: string
  email: string
  role: "super_admin"
  permissions: string[]
}

export function useSuperAdminAuth() {
  const [user, setUser] = useState<SuperAdminUser | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("super_admin_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const signIn = (email: string, password: string) => {
    const mockUser: SuperAdminUser = {
      id: "super_admin_1",
      name: "Super Admin",
      email,
      role: "super_admin",
      permissions: ["all"]
    }
    setUser(mockUser)
    setIsAuthenticated(true)
    localStorage.setItem("super_admin_user", JSON.stringify(mockUser))
    return Promise.resolve(mockUser)
  }

  const signOut = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("super_admin_user")
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signOut
  }
}