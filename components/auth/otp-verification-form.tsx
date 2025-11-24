"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, ArrowLeft, Loader2, RefreshCw } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface OTPVerificationFormProps {
  email?: string
  phone?: string
  onVerify: (_otp: string) => void
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
  const router = useRouter()
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [resendCooldown, setResendCooldown] = useState(0)
  const [isResending, setIsResending] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
    return
  }, [resendCooldown])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-verify when all digits are entered
    if (newOtp.every(digit => digit !== "") && !isLoading) {
      toast.loading("Verifying your code...", {
        description: "Please wait while we confirm your verification code",
        id: "otp-verify"
      })
      onVerify(newOtp.join(""))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleResend = useCallback(async () => {
    setIsResending(true)
    
    toast.loading("Sending new code...", {
      description: `Sending a fresh verification code to ${email || phone}`,
      id: "otp-resend"
    })

    try {
      await onResend()
      setResendCooldown(60)
      
      toast.success("New code sent!", {
        description: "Check your email for the new 6-digit verification code",
        id: "otp-resend"
      })
    } catch (error) {
      toast.error("Failed to send code", {
        description: "Please try again or contact support if the issue persists",
        id: "otp-resend"
      })
    } finally {
      setIsResending(false)
    }
  }, [email, phone, onResend])

  const handleManualVerify = () => {
    const otpCode = otp.join("")
    if (otpCode.length !== 6) {
      toast.error("Incomplete code", {
        description: "Please enter all 6 digits of your verification code"
      })
      return
    }

    toast.loading("Verifying your code...", {
      description: "Please wait while we confirm your verification code",
      id: "otp-verify"
    })
    
    onVerify(otpCode)
  }

  // Show success notification when verification completes
  useEffect(() => {
    if (success) {
      toast.success("Verification successful!", {
        description: "Welcome! You'll be redirected to your dashboard shortly",
        id: "otp-verify",
        icon: <CheckCircle className="h-4 w-4" />
      })
    }
  }, [success])

  // Show error notification
  useEffect(() => {
    if (error) {
      toast.error("Verification failed", {
        description: error.includes("expired") 
          ? "Your code has expired. Please request a new one"
          : "The code you entered is incorrect. Please try again",
        id: "otp-verify",
        action: error.includes("expired") ? {
          label: "Get New Code",
          onClick: handleResend
        } : undefined
      })
    }
  }, [error, handleResend])

  const isComplete = otp.every(digit => digit !== "")

  return (
    <Card className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-xl shadow-sm">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          {success ? (
            <CheckCircle className="h-8 w-8 text-green-600" />
          ) : isLoading ? (
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
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
              <br />
              <span className="text-xs text-slate-500 mt-1 block">
                The code expires in 5 minutes
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
                  className="h-12 w-12 rounded-xl border border-slate-300 text-center text-lg font-semibold focus:border-[#013F5C] focus:outline-none focus:ring-2 focus:ring-[#013F5C]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                />
              ))}
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {error}
                  {error.includes("expired") && (
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResend}
                        disabled={isResending}
                        className="text-xs"
                      >
                        {isResending ? (
                          <>
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-1 h-3 w-3" />
                            Get New Code
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </AlertDescription>
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
                disabled={resendCooldown > 0 || isLoading || isResending}
                className="text-[#013F5C] hover:text-[#0b577a] disabled:opacity-50"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  `Resend in ${resendCooldown}s`
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend code
                  </>
                )}
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
              onClick={() => router.push("/filler")}
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
            onClick={handleManualVerify}
            disabled={!isComplete || isLoading}
            className="bg-[#013F5C] hover:bg-[#0b577a] disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify"
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}