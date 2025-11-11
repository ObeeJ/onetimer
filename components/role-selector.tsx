"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function RoleRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      switch (user.role) {
        case "filler":
          router.push("/filler")
          break
        case "creator":
          router.push("/creator")
          break
        case "admin":
          router.push("/admin")
          break
        case "super_admin":
          router.push("/super-admin")
          break
        default:
          break
      }
    }
  }, [user, isAuthenticated, isLoading, router])

  return null
}