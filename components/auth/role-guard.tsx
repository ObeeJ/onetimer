"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { EmptyState } from "@/components/ui/empty-state"
import { Shield, Lock, Home } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useCreatorAuth } from "@/hooks/use-creator-auth"

interface RoleGuardProps {
  children: React.ReactNode
  requiredRole: "filler" | "creator"
  requireAuth?: boolean
}

export function RoleGuard({ children, requiredRole, requireAuth = true }: RoleGuardProps) {
  const { isAuthenticated: isFillerAuth, loaded: fillerLoaded } = useAuth()
  const { isAuthenticated: isCreatorAuth, loaded: creatorLoaded } = useCreatorAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isLoaded = fillerLoaded && creatorLoaded
  const isAuthenticated = isFillerAuth || isCreatorAuth
  const hasCorrectRole = requiredRole === "filler" ? isFillerAuth : isCreatorAuth
  const hasWrongRole = requiredRole === "filler" ? isCreatorAuth : isFillerAuth

  useEffect(() => {
    if (!isLoaded) return

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      router.push(`/${requiredRole}/auth/sign-in`)
      return
    }

    // If user has wrong role, redirect to their appropriate dashboard
    if (isAuthenticated && hasWrongRole) {
      const redirectUrl = requiredRole === "filler" ? "/creator/dashboard" : "/filler"
      router.push(redirectUrl)
      return
    }
  }, [isLoaded, isAuthenticated, hasCorrectRole, hasWrongRole, requireAuth, requiredRole, router])

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="flex-1 min-w-0 overflow-auto">
        <div className="mx-auto max-w-none space-y-8 p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-center min-h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          </div>
        </div>
      </div>
    )
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="flex-1 min-w-0 overflow-auto">
        <div className="mx-auto max-w-none space-y-8 p-4 sm:p-6 lg:p-8">
          <EmptyState
            icon={Lock}
            title="Authentication required"
            description={`Please sign in to access ${requiredRole} features.`}
            action={{ 
              label: "Sign in", 
              href: `/${requiredRole}/auth/sign-in` 
            }}
          />
        </div>
      </div>
    )
  }

  // If user has wrong role
  if (isAuthenticated && hasWrongRole) {
    const correctDashboard = requiredRole === "filler" ? "creator" : "filler"
    return (
      <div className="flex-1 min-w-0 overflow-auto">
        <div className="mx-auto max-w-none space-y-8 p-4 sm:p-6 lg:p-8">
          <EmptyState
            icon={Shield}
            title="Access denied"
            description={`This area is for ${requiredRole}s only. You're signed in as a ${correctDashboard}.`}
            action={{ 
              label: `Go to ${correctDashboard} dashboard`, 
              href: correctDashboard === "creator" ? "/creator/dashboard" : "/filler"
            }}
          />
        </div>
      </div>
    )
  }

  // If user is authenticated and has correct role, or no auth required
  if (!requireAuth || (isAuthenticated && hasCorrectRole)) {
    return <>{children}</>
  }

  // Fallback
  return (
    <div className="flex-1 min-w-0 overflow-auto">
      <div className="mx-auto max-w-none space-y-8 p-4 sm:p-6 lg:p-8">
        <EmptyState
          icon={Home}
          title="Access error"
          description="Unable to verify access permissions."
          action={{ label: "Go home", href: "/" }}
        />
      </div>
    </div>
  )
}