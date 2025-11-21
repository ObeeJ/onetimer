"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Mail } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"

import { AnimatedBackground } from "@/components/ui/animated-background"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const role = searchParams.get('role') || 'filler' // Default to filler

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const user = await signIn(email, password)
      // Redirect based on user role
      switch (user.role) {
        case "filler":
          router.push("/filler")
          break
        case "creator":
          router.push("/creator")
          break
        case "admin":
          router.push("/admin")
          break
        case "super_admin":
          router.push("/super-admin")
          break
        default:
          router.push("/")
      }
    } catch (err) {
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // TODO: Implement forgot password API call
      console.log("Sending reset email to:", email)
      setResetEmailSent(true)
    } catch (error) {
      setError("Failed to send reset email. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center p-4">
      <AnimatedBackground />
      <div className="absolute top-4 left-4 z-20">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center space-y-4 pb-6">
          <Image src="/Logo.png" alt="Onetime Survey" width={192} height={48} className="mx-auto" />
          <CardTitle className="text-2xl font-bold text-slate-900">
            {role === 'creator' ? 'Creator Sign In' : 'Filler Sign In'}
          </CardTitle>
          <p className="text-slate-600">Sign in to your account</p>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="h-12 border-slate-300 focus:border-[#013F5C] focus:ring-1 focus:ring-[#013F5C]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <Input 
                type="password" 
                placeholder="Enter your password" 
                className="h-12 border-slate-300 focus:border-[#013F5C] focus:ring-1 focus:ring-[#013F5C]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full bg-[#013F5C] hover:bg-[#012d42] h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-[#013F5C] hover:underline"
            >
              Forgot your password?
            </button>
          </div>

          <div className="text-center mt-6 space-y-4">
            <p className="text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <Link 
                href={role === 'creator' ? '/creator/onboarding' : '/auth/signup'} 
                className="text-[#013F5C] hover:underline font-medium"
              >
                Sign up as {role === 'creator' ? 'Creator' : 'Filler'}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md shadow-xl border-0 bg-white">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-bold text-slate-900">Reset Password</CardTitle>
              <p className="text-slate-600">Enter your email to receive a reset link</p>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {!resetEmailSent ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      className="h-12 border-slate-300 focus:border-[#013F5C] focus:ring-1 focus:ring-[#013F5C]"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm text-center">{error}</p>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowForgotPassword(false)
                        setResetEmailSent(false)
                        setError("")
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-[#013F5C] hover:bg-[#012d42]"
                      disabled={isLoading}
                    >
                      {isLoading ? "Sending..." : "Send Reset Link"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <Mail className="h-12 w-12 mx-auto text-green-600" />
                  <p className="text-slate-700">Reset link sent to {email}</p>
                  <p className="text-sm text-slate-500">Check your email and follow the instructions to reset your password.</p>
                  <Button 
                    className="w-full bg-[#013F5C] hover:bg-[#012d42]"
                    onClick={() => {
                      setShowForgotPassword(false)
                      setResetEmailSent(false)
                      setError("")
                    }}
                  >
                    Back to Sign In
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}