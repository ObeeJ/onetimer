"use client"

import { useAuth } from "@/providers/auth-provider"
import { useCallback, useEffect, useState } from "react"

type Creator = {
  id: string
  name: string
  email: string
  organizationType: "business" | "research" | "education" | "individual"
  organizationName?: string
  status: "pending" | "approved" | "rejected"
  credits: number
  isVerified: boolean
}

const KEY = "creator:user"

export function useCreatorAuth() {
  const { user, isAuthenticated, signIn: globalSignIn, signOut: globalSignOut, isLoading } = useAuth()
  const [creator, setCreator] = useState<Creator | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) setCreator(JSON.parse(raw))
    } catch {}
  }, [])

  const signIn = useCallback((c: Creator) => {
    localStorage.setItem(KEY, JSON.stringify(c))
    setCreator(c)
    globalSignIn({
      id: c.id,
      name: c.name,
      email: c.email,
      role: "creator",
      isVerified: c.isVerified
    })
  }, [globalSignIn])

  const signOut = useCallback(() => {
    localStorage.removeItem(KEY)
    setCreator(null)
    globalSignOut()
  }, [globalSignOut])

  const updateCredits = useCallback((credits: number) => {
    if (creator) {
      const updated = { ...creator, credits }
      localStorage.setItem(KEY, JSON.stringify(updated))
      setCreator(updated)
    }
  }, [creator])

  return {
    creator,
    user: creator,
    loaded: !isLoading,
    signIn,
    signOut,
    updateCredits,
    isAuthenticated: isAuthenticated && user?.role === "creator",
    isApproved: creator?.status === "approved",
  }
}