"use client"

import { useAuth } from "@/providers/auth-provider"
import { useState, useEffect } from "react"

interface AdminUser {
  id: string
  name: string
  email: string
  role: "super_admin" | "admin"
}

export function useAdminAuth() {
  const { user, isAuthenticated, signIn: globalSignIn, signOut: globalSignOut, isLoading } = useAuth()
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("admin_user")
    if (storedUser) {
      setAdminUser(JSON.parse(storedUser))
    }
  }, [])

  const signIn = (email: string, password: string) => {
    const mockUser: AdminUser = {
      id: "admin_1",
      name: "Admin User",
      email,
      role: "admin"
    }
    setAdminUser(mockUser)
    localStorage.setItem("admin_user", JSON.stringify(mockUser))
    globalSignIn({
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
      role: "admin",
      isVerified: true
    })
    return Promise.resolve(mockUser)
  }

  const signOut = () => {
    setAdminUser(null)
    localStorage.removeItem("admin_user")
    globalSignOut()
  }

  return {
    user: adminUser,
    isAuthenticated: isAuthenticated && user?.role === "admin",
    isLoading,
    signIn,
    signOut
  }
}