"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"
import { authenticateUser } from "@/lib/mock-users"
import { AnimatedBackground } from "@/components/ui/animated-background"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const user = authenticateUser(email, password)
      if (user) {
        signIn(user)
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
      } else {
        setError("Invalid email or password")
      }
    } catch (err) {
      setError("Login failed. Please try again.")
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
          <img src="/Logo.png" alt="Onetime Survey" className="h-12 w-auto mx-auto" />
          <CardTitle className="text-2xl font-bold text-slate-900">Welcome back</CardTitle>
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
          <div className="text-center mt-6 space-y-4">
            <p className="text-sm text-slate-600">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-[#013F5C] hover:underline font-medium">
                Sign up
              </Link>
            </p>
            <div className="p-4 bg-slate-50 rounded-lg border">
              <p className="text-xs font-medium text-slate-700 mb-2">Demo credentials:</p>
              <div className="space-y-1 text-xs text-slate-600">
                <p><span className="font-medium">Filler:</span> john@example.com / password</p>
                <p><span className="font-medium">Creator:</span> mike@example.com / password</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}