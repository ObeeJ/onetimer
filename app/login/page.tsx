"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src="/Logo.png" alt="OneTime Survey" className="h-12 w-auto mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Enter your email" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Enter your password" />
          </div>
          <Button className="w-full">
            Sign In
          </Button>
          <div className="text-center space-y-2">
            <p className="text-sm text-slate-600">Demo Access:</p>
            <div className="flex gap-2 flex-wrap justify-center">
              <Link href="/filler" className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Filler</Link>
              <Link href="/creator" className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Creator</Link>
              <Link href="/admin" className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Admin</Link>
              <Link href="/super-admin" className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Super Admin</Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}