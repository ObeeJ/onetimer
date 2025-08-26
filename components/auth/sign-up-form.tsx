"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { fetchJSON } from "@/hooks/use-api"

export default function SignUpForm() {
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const sendOtp = async () => {
    if (!email || !password) {
      setError("Please fill in all required fields")
      return
    }
    
    if (!email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setError("")
    setSending(true)
    
    try {
      // Use fetchJSON so client-only mocks are used in the browser
      await fetchJSON("/api/auth/send-otp", { method: "POST", body: JSON.stringify({ email, phone }) })
      router.push("/filler/onboarding/verify?email=" + encodeURIComponent(email))
    } catch (err) {
      setError("Something went wrong. Please try again.")
      console.error("Sign up error:", err)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && email && password && !sending) {
      sendOtp()
    }
  }

  return (
    <div className="w-full max-w-sm">
      <Card className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-xl shadow-sm">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
                    <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone</label>
            <Input 
              type="tel" 
              placeholder="+2348012345678" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)}
              onKeyPress={handleKeyPress} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              required
            />
          </div>
          <Button
            className="h-11 w-full rounded-2xl bg-[#C1654B] text-white hover:bg-[#b25a43]"
            size="lg"
            onClick={sendOtp}
            disabled={sending || !email || !password}
          >
            {sending ? "Sending…" : "Create account"}
          </Button>
          <Button variant="outline" className="h-11 w-full rounded-2xl bg-transparent" size="lg" asChild>
            <Link href="/filler/auth/sign-in">I already have an account</Link>
          </Button>
        </CardContent>
        <CardFooter className="justify-center text-sm">By continuing you agree to our terms.</CardFooter>
      </Card>
    </div>
  )
}
