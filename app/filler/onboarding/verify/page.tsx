"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import OTPInput from "@/components/auth/otp-input"
import { useState } from "react"

export default function VerifyPage() {
  const search = useSearchParams()
  const email = search.get("email") ?? ""
  const router = useRouter()
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [otpCode, setOtpCode] = useState("")

  const onComplete = async (code: string) => {
    setOtpCode(code)
  }

  const handleVerify = async () => {
    if (!otpCode || otpCode.length !== 6) return

    setVerifying(true)
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: otpCode, email }),
      })

      if (response.ok) {
        router.push("/filler")
      } else {
        throw new Error('Verification failed')
      }
    } catch (error) {
      console.error("Verification failed:", error)
    } finally {
      setVerifying(false)
    }
  }

  const resend = async () => {
    setResending(true)
    try {
      await fetch("/api/auth/send-otp", {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
    } catch (error) {
      console.error("Resend failed:", error)
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Verify your account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">Enter the 6-digit code sent to {email || "your email"}.</p>
          <OTPInput onComplete={onComplete} />
          <div className="flex items-center justify-between text-sm">
            <Button variant="outline" className="rounded-xl bg-transparent" onClick={() => router.back()}>
              Back
            </Button>
            <Button
              className="rounded-xl bg-[#013F5C] text-white hover:bg-[#0b577a]"
              onClick={resend}
              disabled={resending}
            >
              {resending ? "Resending…" : "Resend code"}
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="h-11 w-full rounded-2xl bg-[#C1654B] text-white hover:bg-[#b25a43]"
            size="lg"
            disabled={verifying || otpCode.length !== 6}
            onClick={handleVerify}
          >
            {verifying ? "Verifying…" : "Enter code to continue"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
