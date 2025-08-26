"use client"

import { useState, useEffect } from "react"
import type { CreatorProfile } from "@/types/creator"

const CREATOR_STORAGE_KEY = "creator:profile"

export function useCreatorAuth() {
  const [creator, setCreator] = useState<CreatorProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load creator from localStorage on mount
    const stored = localStorage.getItem(CREATOR_STORAGE_KEY)
    if (stored) {
      try {
        setCreator(JSON.parse(stored))
      } catch (error) {
        console.error("Failed to parse stored creator profile:", error)
        localStorage.removeItem(CREATOR_STORAGE_KEY)
      }
    }
    setLoading(false)
  }, [])

  const login = (profile: CreatorProfile) => {
    setCreator(profile)
    localStorage.setItem(CREATOR_STORAGE_KEY, JSON.stringify(profile))
  }

  const logout = () => {
    setCreator(null)
    localStorage.removeItem(CREATOR_STORAGE_KEY)
  }

  const updateProfile = (updates: Partial<CreatorProfile>) => {
    if (!creator) return
    
    const updated = { ...creator, ...updates }
    setCreator(updated)
    localStorage.setItem(CREATOR_STORAGE_KEY, JSON.stringify(updated))
  }

  return {
    creator,
    loading,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!creator,
    isApproved: creator?.status === 'approved'
  }
}
