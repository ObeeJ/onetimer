"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { EmptyState } from "@/components/ui/empty-state"
import { Shield, Lock, Home } from "lucide-react"

interface RoleGuardProps {
  children: React.ReactNode
  requiredRole: "filler" | "creator" | "admin" | "super-admin"
  requireAuth?: boolean
}

// Mock authentication - replace with real auth later
function useMockAuth() {
  const [user, setUser] = useState<{ role: string; name: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // Simulate auth check
    const mockUser = {
      role: "admin", // Default role for testing - change as needed
      name: "Test User"
    }
    setUser(mockUser)
    setIsLoading(false)
  }, [])
  
  return { user, isLoading, isAuthenticated: !!user }
}

export function RoleGuard({ children, requiredRole, requireAuth = true }: RoleGuardProps) {
  const { user, isLoading, isAuthenticated } = useMockAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return

    // If auth required but user not authenticated
    if (requireAuth && !isAuthenticated) {
      router.push("/login")
      return
    }

    // If user authenticated but wrong role
    if (isAuthenticated && user?.role !== requiredRole) {
      router.push("/unauthorized")
      return
    }
  }, [isLoading, isAuthenticated, user, requireAuth, requiredRole, router])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <EmptyState
          icon={Lock}
          title="Authentication required"
          description="Please sign in to access this area."
          action={{ label: "Sign in", href: "/login" }}
        />
      </div>
    )
  }

  // Wrong role
  if (isAuthenticated && user?.role !== requiredRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <EmptyState
          icon={Shield}
          title="Access denied"
          description={`This area requires ${requiredRole} access.`}
          action={{ label: "Go back", href: "/" }}
        />
      </div>
    )
  }

  // Authorized - render children
  return <>{children}</>
}