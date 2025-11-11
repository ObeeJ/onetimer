/*
 * DEPRECATED: This hook has been consolidated into the single useAuth() hook in providers/auth-provider.tsx
 * DO NOT USE - Kept for reference only
 *
 * SECURITY ISSUE: Creates mock admin user without proper verification
 * Use providers/auth-provider.tsx -> useAuth() instead
 */

/*
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
      role: "admin" // SECURITY ISSUE: Grants admin role without verification
    }
    setAdminUser(mockUser)
    localStorage.setItem("admin_user", JSON.stringify(mockUser))
    globalSignIn(email, password)
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
*/