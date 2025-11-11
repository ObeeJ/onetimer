"use client"

/**
 * Consolidated authentication hooks
 * Replaces: useCreatorAuth, useAdminAuth, useSuperAdminAuth
 * Single source of truth for all authentication logic
 */

import { useAuth as useAuthProvider } from "@/providers/auth-provider"

/**
 * Main authentication hook - use this everywhere instead of role-specific auth hooks
 * @returns auth state and methods from AuthProvider
 */
export const useAuth = useAuthProvider

/**
 * Check if current user is a creator
 */
export function useIsCreator() {
  const { user } = useAuthProvider()
  return user?.role === "creator"
}

/**
 * Check if current user is an admin
 */
export function useIsAdmin() {
  const { user } = useAuthProvider()
  return user?.role === "admin"
}

/**
 * Check if current user is a super admin
 */
export function useIsSuperAdmin() {
  const { user } = useAuthProvider()
  return user?.role === "super_admin"
}

/**
 * Check if current user is a filler
 */
export function useIsFiller() {
  const { user } = useAuthProvider()
  return user?.role === "filler"
}

/**
 * Check if user has any of the specified roles
 */
export function useHasRole(roles: string[]) {
  const { user } = useAuthProvider()
  return user?.role ? roles.includes(user.role) : false
}

/**
 * Get current user's role
 */
export function useUserRole() {
  const { user } = useAuthProvider()
  return user?.role || null
}
