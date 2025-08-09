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

  const onComplete = async (code: string) => {
    setVerifying(true)
    // AWS SES mock verify endpoint
    await fetch("/api/auth/verify-otp", { method: "POST", body: JSON.stringify({ code, email }) })
    setVerifying(false)
    router.push("/filler/onboarding")
  }

  const resend = async () => {
    setResending(true)
    // AWS SES mock send OTP
    await fetch("/api/auth/send-otp", { method: "POST", body: JSON.stringify({ email }) })
    setResending(false)
  }

  return (
    <div className="flex min-h-[calc(100svh-3.5rem)] items-center justify-center p-4">
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
          <Button className="h-11 w-full rounded-2xl" size="lg" disabled>
            {verifying ? "Verifying…" : "Enter code to continue"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
