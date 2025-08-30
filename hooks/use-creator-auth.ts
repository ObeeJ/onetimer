"use client"

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
  const [creator, setCreator] = useState<Creator | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) setCreator(JSON.parse(raw))
    } catch {}
    setLoaded(true)
  }, [])

  const signIn = useCallback((c: Creator) => {
    localStorage.setItem(KEY, JSON.stringify(c))
    setCreator(c)
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem(KEY)
    setCreator(null)
  }, [])

  const updateCredits = useCallback((credits: number) => {
    if (creator) {
      const updated = { ...creator, credits }
      localStorage.setItem(KEY, JSON.stringify(updated))
      setCreator(updated)
    }
  }, [creator])

  return {
    creator,
    loaded,
    signIn,
    signOut,
    updateCredits,
    isAuthenticated: !!creator,
    isApproved: creator?.status === "approved",
  }
}