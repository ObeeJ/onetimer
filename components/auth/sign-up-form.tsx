"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, AlertCircle, Check, Loader2, Mail } from "lucide-react"
import { toast } from "sonner"

export default function SignUpForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validatePassword = (password: string) => {
    if (password.length < 8) return false
    if (!/[A-Z]/.test(password)) return false
    if (!/[a-z]/.test(password)) return false
    if (!/[0-9]/.test(password)) return false
    if (!/[^A-Za-z0-9]/.test(password)) return false
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match")
      setIsLoading(false)
      toast.error("Password mismatch", {
        description: "Please make sure both password fields match exactly"
      })
      return
    }

    if (!validatePassword(formData.password)) {
      setError("Password must be at least 8 characters long")
      setIsLoading(false)
      toast.error("Weak password", {
        description: "Password must contain uppercase, lowercase, number, and special character"
      })
      return
    }

    // Show loading notification
    toast.loading("Creating your account...", {
      description: "Sending verification code to your email",
      id: "signup-loading"
    })

    try {
      // Send OTP for email verification
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      })

      if (response.ok) {
        // Success notification
        toast.success("Account created!", {
          description: "Check your email for a verification code to complete setup",
          id: "signup-loading",
          icon: <Mail className="h-4 w-4" />
        })
        
        // Redirect to OTP verification with delay to show success message
        setTimeout(() => {
          router.push(`/filler/auth/verify-otp?email=${encodeURIComponent(formData.email)}`)
        }, 1000)
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create account')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create account. Please try again."
      setError(errorMessage)
      
      toast.error("Account creation failed", {
        description: errorMessage.includes("exists") 
          ? "This email is already registered. Try signing in instead"
          : "Please check your details and try again",
        id: "signup-loading",
        action: errorMessage.includes("exists") ? {
          label: "Sign In",
          onClick: () => router.push("/filler/auth/sign-in")
        } : undefined
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Join thousands earning money by sharing their opinions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                required
                disabled={isLoading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {validatePassword(formData.password) ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <div className="h-3 w-3 rounded-full border border-slate-300" />
              )}
              <span className={validatePassword(formData.password) ? "text-green-600" : "text-slate-500"}>
                At least 8 characters
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                required
                disabled={isLoading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-[#013F5C] hover:bg-[#0b577a] disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
          
          <div className="text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/filler/auth/sign-in" className="text-[#013F5C] hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}