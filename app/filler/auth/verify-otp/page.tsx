"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import OTPVerificationForm from "@/components/auth/otp-verification-form"

export default function VerifyOTPPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { signIn } = useAuth()
  const email = searchParams.get("email")
  const phone = searchParams.get("phone")

  const handleVerify = async (otp: string) => {
    try {
      // TODO: Replace with actual API call to verify OTP
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock successful verification and sign in - user is verified after OTP
      signIn({
        id: "1",
        name: "New User",
        email: email || undefined,
        phone: phone || undefined,
        isVerified: true
      })
      
      router.push("/filler/onboarding")
    } catch (error) {
      throw new Error("Invalid verification code")
    }
  }

  const handleResend = async () => {
    try {
      // TODO: Replace with actual API call to resend OTP
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error("Failed to resend OTP")
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
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
    </main>
  )
}