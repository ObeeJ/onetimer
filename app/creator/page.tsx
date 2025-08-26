"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function CreatorPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('creator-onboarding-completed')
    
    if (!hasCompletedOnboarding) {
      router.push('/creator/onboarding')
    } else {
      router.push('/creator/dashboard')
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#013f5c] mx-auto"></div>
        <p className="mt-2 text-slate-600">Loading...</p>
      </div>
    </div>
  )
}
