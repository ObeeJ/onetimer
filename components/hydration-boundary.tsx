"use client"

import { useEffect, useState } from "react"

interface HydrationBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function HydrationBoundary({ children, fallback = null }: HydrationBoundaryProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}