"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SignInForm() {
  const { signIn } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  return (
    <div className="w-full max-w-sm">
      <Card className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-xl shadow-sm">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
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
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button
            className="h-11 w-full rounded-2xl bg-[#013F5C] text-white hover:bg-[#0b577a]"
            size="lg"
            onClick={() => {
              signIn({ id: "u_" + Date.now(), name: "OneTimer", email })
              router.push("/filler")
            }}
            disabled={!email || !password}
          >
            Continue
          </Button>
        </CardContent>
        <CardFooter className="justify-center text-sm">
          No account?
          <Link href="/filler/auth/sign-up" className="ml-1 underline underline-offset-4">
            Sign up
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
