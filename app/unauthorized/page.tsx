"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"
import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-red-50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold text-red-600">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-600">You don't have permission to access this area.</p>
          <div className="space-y-2">
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <Link href="/">Go Home</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}