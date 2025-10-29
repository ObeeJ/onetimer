"use client"

import { useAuth } from "@/providers/auth-provider"
import { useState, useEffect } from "react"

interface SuperAdminUser {
  id: string
  name: string
  email: string
  role: "super_admin"
  permissions: string[]
}

export function useSuperAdminAuth() {
  const { user, isAuthenticated, signIn: globalSignIn, signOut: globalSignOut, isLoading } = useAuth()
  const [superAdminUser, setSuperAdminUser] = useState<SuperAdminUser | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("super_admin_user")
    if (storedUser) {
      setSuperAdminUser(JSON.parse(storedUser))
    }
  }, [])

  const signIn = (email: string, password: string) => {
    const mockUser: SuperAdminUser = {
      id: "super_admin_1",
      name: "Super Admin",
      email,
      role: "super_admin",
      permissions: ["all"]
    }
    setSuperAdminUser(mockUser)
    localStorage.setItem("super_admin_user", JSON.stringify(mockUser))
    globalSignIn(email, password)
    return Promise.resolve(mockUser)
  }

  const signOut = () => {
    setSuperAdminUser(null)
    localStorage.removeItem("super_admin_user")
    globalSignOut()
  }

  return {
    user: superAdminUser,
    isAuthenticated: isAuthenticated && user?.role === "super_admin",
    isLoading,
    signIn,
    signOut
  }
}