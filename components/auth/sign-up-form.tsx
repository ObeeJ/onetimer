"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SignUpForm() {
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [sending, setSending] = useState(false)
  const router = useRouter()

  const sendOtp = async () => {
    setSending(true)
    // AWS SES mock: Replace this endpoint with your SES-backed endpoint
    await fetch("/api/auth/send-otp", { method: "POST", body: JSON.stringify({ email, phone }) })
    setSending(false)
    router.push("/filler/onboarding/verify?email=" + encodeURIComponent(email))
  }

  return (
    <div className="w-full max-w-sm">
      <Card className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-xl shadow-sm">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone</label>
            <Input type="tel" placeholder="+2348012345678" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
