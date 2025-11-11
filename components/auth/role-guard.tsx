"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { Shield, Lock } from "lucide-react"

interface RoleGuardProps {
  children: React.ReactNode
  requiredRole: "filler" | "creator" | "admin" | "super-admin"
  requireAuth?: boolean
}

export function RoleGuard({ children, requiredRole, requireAuth = false }: RoleGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // While loading, don't redirect
    if (isLoading) return

    // If auth is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      router.push("/auth/login")
      return
    }

    // If user is authenticated but doesn't have the required role
    if (isAuthenticated && user?.role !== requiredRole) {
      router.push("/unauthorized")
      return
    }
  }, [isAuthenticated, user?.role, requiredRole, isLoading, requireAuth, router])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-slate-400 animate-pulse" />
          <p className="text-slate-600">Verifying access...</p>
        </div>
      </div>
    )
  }

  // If auth is required but user is not authenticated, don't render anything
  if (requireAuth && !isAuthenticated) {
    return null
  }

  // If user doesn't have the required role, don't render anything
  if (isAuthenticated && user?.role !== requiredRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Lock className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-600 mb-4">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-slate-500">
            Required role: <span className="font-semibold">{requiredRole}</span>
            <br />
            Your role: <span className="font-semibold">{user?.role || "none"}</span>
          </p>
        </div>
      </div>
    )
  }

  // If everything is okay, render the children
  return <>{children}</>
}