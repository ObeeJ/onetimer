"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Mail, CheckCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react"
import { toast } from "sonner"

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    // Show loading notification
    toast.loading("Sending reset link...", {
      description: `Preparing password reset instructions for ${email}`,
      id: "forgot-password"
    })
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setIsSubmitted(true)
        
        // Success notification
        toast.success("Reset link sent!", {
          description: `Check your email at ${email} for password reset instructions`,
          id: "forgot-password",
          icon: <CheckCircle className="h-4 w-4" />
        })
      } else {
        throw new Error(data.error || 'Failed to send reset email')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email'
      setError(errorMessage)
      
      // Error notification with helpful guidance
      toast.error("Failed to send reset link", {
        description: errorMessage.includes("not found") 
          ? "This email address isn't registered. Please check the spelling or sign up for a new account"
          : "Please check your internet connection and try again",
        id: "forgot-password",
        action: errorMessage.includes("not found") ? {
          label: "Sign Up",
          onClick: () => window.location.href = "/filler/onboarding"
        } : undefined
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTryAgain = () => {
    setIsSubmitted(false)
    setError("")
    setEmail("")
    
    toast.info("Ready to try again", {
      description: "Enter your email address to receive a new reset link"
    })
  }

  if (isSubmitted) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We've sent a password reset link to{" "}
            <span className="font-medium text-slate-900">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert className="border-blue-200 bg-blue-50">
              <Mail className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                <div className="space-y-2">
                  <p className="font-medium">What to do next:</p>
                  <ul className="text-sm space-y-1 ml-4 list-disc">
                    <li>Check your email inbox for our message</li>
                    <li>Click the "Reset Password" link in the email</li>
                    <li>Create a new secure password</li>
                    <li>Sign in with your new password</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
            
            <p className="text-sm text-slate-600 text-center">
              Didn't receive the email? Check your spam folder or request a new link.
            </p>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleTryAgain}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Send another link
            </Button>
            
            <div className="text-center">
              <Link 
                href="/filler/auth/sign-in" 
                className="text-sm text-[#013F5C] hover:underline inline-flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>
          Enter your email address and we'll send you a secure link to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
                {error.includes("not found") && (
                  <div className="mt-2">
                    <Link 
                      href="/filler/onboarding"
                      className="text-sm underline hover:no-underline"
                    >
                      Don't have an account? Sign up here
                    </Link>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
              disabled={isLoading}
            />
            <p className="text-xs text-slate-500">
              We'll send reset instructions to this email address
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-[#013F5C] hover:bg-[#0b577a] disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending reset link...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send reset link
              </>
            )}
          </Button>
          
          <div className="text-center">
            <Link 
              href="/filler/auth/sign-in" 
              className="text-sm text-[#013F5C] hover:underline inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}