"use client"

import Link from "next/link"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, DollarSign } from "lucide-react"

export default function FillerAuthPage() {
  const [authMode, setAuthMode] = useState<'choose' | 'signin' | 'signup'>('choose')

  if (authMode === 'signin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAuthMode('choose')}
              className="absolute left-4 top-4"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="mx-auto w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <CardTitle>Welcome Back!</CardTitle>
            <p className="text-sm text-slate-600">Sign in to start earning from surveys</p>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-sm text-slate-500 mb-4">
                Filler sign in functionality will be implemented with your Go backend
              </p>
              <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                <Link href="/filler/surveys">
                  Continue to Survey Hub (Demo)
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (authMode === 'signup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAuthMode('choose')}
              className="absolute left-4 top-4"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="mx-auto w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <CardTitle>Start Earning Today</CardTitle>
            <p className="text-sm text-slate-600">Create your account and complete your first survey</p>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-sm text-slate-500 mb-4">
                New user registration will redirect to onboarding
              </p>
              <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                <Link href="/filler/onboarding">
                  Start Earning Process
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Button asChild variant="ghost" size="sm" className="absolute left-4 top-4">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="mx-auto w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <CardTitle>Earn Online Portal</CardTitle>
          <p className="text-sm text-slate-600">Sign in or create your earning account</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => setAuthMode('signin')}
            variant="outline" 
            className="w-full"
          >
            I have an account - Sign In
          </Button>
          <Button 
            onClick={() => setAuthMode('signup')}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            I'm new here - Start Earning
          </Button>
          <div className="text-center pt-4">
            <p className="text-xs text-slate-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
