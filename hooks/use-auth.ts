"use client"

import { useCallback, useEffect, useState } from "react"

type User = {
  id: string
  name: string
  email?: string
  phone?: string
}

const KEY = "sf:user"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) setUser(JSON.parse(raw))
    } catch {}
    setLoaded(true)
  }, [])

  const signIn = useCallback((u: User) => {
    localStorage.setItem(KEY, JSON.stringify(u))
    setUser(u)
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem(KEY)
    setUser(null)
  }, [])

  return {
    user,
    loaded,
    signIn,
    signOut,
    isAuthenticated: !!user,
  }
}
