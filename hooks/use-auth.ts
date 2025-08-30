"use client"

import { useAuth as useGlobalAuth } from "@/providers/auth-provider"

export function useAuth() {
  return useGlobalAuth()
}
