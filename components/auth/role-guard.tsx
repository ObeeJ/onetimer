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
  // Temporarily bypass auth for deployment testing
  return <>{children}</>