"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import OTPVerificationForm from "@/components/auth/otp-verification-form"

function VerifyOTPContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { signIn } = useAuth()
  const email = searchParams.get("email")
  const phone = searchParams.get("phone")

  const handleVerify = async (otp: string) => {
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          otp: otp, 
          email: email || undefined,
          phone: phone || undefined 
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        await signIn(email || '', '') // Will get user data from backend
        router.push("/filler/onboarding")
      } else {
        throw new Error("Invalid verification code")
      }
    } catch (error) {
      throw new Error("Invalid verification code")
    }
  }

  const handleResend = async () => {
    try {
      await fetch('/api/auth/send-otp', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email || undefined,
          phone: phone || undefined 
        })
      })
    } catch (error) {
      console.error("Failed to resend OTP")
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <img src="/Logo.png" alt="OneTime Survey" className="h-16 w-auto mx-auto mb-4" />
      </div>
      <OTPVerificationForm 
        email={email || undefined}
        phone={phone || undefined}
        onVerify={handleVerify}
        onResend={handleResend}
      />
    </div>
  )
}

export default function VerifyOTPPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <VerifyOTPContent />
      </Suspense>
    </main>
  )
}