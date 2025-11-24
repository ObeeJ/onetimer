"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

export default function SignInForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Show loading toast
    toast.loading("Signing you in...", {
      description: "Please wait while we verify your credentials",
      id: "signin-loading"
    })

    try {
      const user = await signIn(email, password)

      // Success notification
      toast.success("Welcome back!", {
        description: `Successfully signed in as ${user.role}. Redirecting to your dashboard...`,
        id: "signin-loading",
        icon: <CheckCircle className="h-4 w-4" />
      })

      // Redirect based on user role
      const roleRoutes = {
        filler: '/filler',
        creator: '/creator',
        admin: '/admin',
        super_admin: '/super-admin'
      }

      const redirectPath = roleRoutes[user.role as keyof typeof roleRoutes] || '/filler'
      
      // Small delay to show success message
      setTimeout(() => {
        router.push(redirectPath)
      }, 1000)

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Invalid email or password. Please try again."
      setError(errorMessage)
      
      // Error notification with helpful guidance
      toast.error("Sign in failed", {
        description: errorMessage.includes("Invalid") 
          ? "Double-check your email and password, or try resetting your password"
          : errorMessage,
        id: "signin-loading",
        action: errorMessage.includes("Invalid") ? {
          label: "Reset Password",
          onClick: () => router.push("/filler/auth/forgot-password")
        } : undefined
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>
          Sign in to your account to continue earning
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
                {error.includes("Invalid") && (
                  <div className="mt-2">
                    <Link 
                      href="/filler/auth/forgot-password"
                      className="text-sm underline hover:no-underline"
                    >
                      Forgot your password? Reset it here
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
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pr-10"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 disabled:opacity-50"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Link 
              href="/filler/auth/forgot-password" 
              className="text-sm text-[#013F5C] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-[#013F5C] hover:bg-[#0b577a] disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
          
          <div className="text-center text-sm text-slate-600">
            Don't have an account?{" "}
            <Link href="/filler/onboarding" className="text-[#013F5C] hover:underline">
              Get started
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}