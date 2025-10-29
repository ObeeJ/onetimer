"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface OTPVerificationFormProps {
  email?: string
  phone?: string
  onVerify: (otp: string) => void
  onResend: () => void
  isLoading?: boolean
  error?: string
  success?: boolean
}

export default function OTPVerificationForm({ 
  email, 
  phone, 
  onVerify, 
  onResend, 
  isLoading = false, 
  error, 
  success = false 
}: OTPVerificationFormProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [resendCooldown, setResendCooldown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    if (newOtp.every(digit => digit !== "") && !isLoading) {
      onVerify(newOtp.join(""))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleResend = () => {
    onResend()
    setResendCooldown(60)
  }

  const isComplete = otp.every(digit => digit !== "")

  return (
    <Card className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-xl shadow-sm">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          {success ? (
            <CheckCircle className="h-8 w-8 text-green-600" />
          ) : (
            <div className="text-2xl">📱</div>
          )}
        </div>
        <CardTitle className="text-xl">
          {success ? "Verification Complete!" : "Enter verification code"}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!success && (
          <>
            <p className="text-center text-sm text-slate-600">
              We've sent a 6-digit code to{" "}
              <span className="font-medium text-slate-900">
                {email || phone}
              </span>
            </p>

            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="h-12 w-12 rounded-xl border border-slate-300 text-center text-lg font-semibold focus:border-[#013F5C] focus:outline-none focus:ring-2 focus:ring-[#013F5C]/20"
                  disabled={isLoading}
                />
              ))}
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">
                Didn't receive the code?
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResend}
                disabled={resendCooldown > 0 || isLoading}
                className="text-[#013F5C] hover:text-[#0b577a]"
              >
                {resendCooldown > 0 
                  ? `Resend in ${resendCooldown}s` 
                  : "Resend code"
                }
              </Button>
            </div>
          </>
        )}

        {success && (
          <div className="text-center space-y-4">
            <p className="text-slate-600">
              Your account has been successfully verified!
            </p>
            <Button 
              className="w-full bg-[#013F5C] hover:bg-[#0b577a]"
              onClick={() => window.location.href = "/filler"}
            >
              Continue to Dashboard
            </Button>
          </div>
        )}
      </CardContent>

      {!success && (
        <CardFooter className="flex justify-between">
          <Button asChild variant="ghost" size="sm">
            <Link href="/filler/auth/sign-in" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </Button>
          
          <Button
            onClick={() => onVerify(otp.join(""))}
            disabled={!isComplete || isLoading}
            className="bg-[#013F5C] hover:bg-[#0b577a]"
          >
            {isLoading ? "Verifying..." : "Verify"}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}