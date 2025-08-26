"use client"

import Link from "next/link"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BarChart3 } from "lucide-react"

export default function CreatorAuthPage() {
  const [authMode, setAuthMode] = useState<'choose' | 'signin' | 'signup'>('choose')

  if (authMode === 'signin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <Card className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-sm">
          <CardHeader className="text-center px-6 py-8 relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAuthMode('choose')}
              className="absolute left-4 top-4 hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="mx-auto w-16 h-16 bg-[#013f5c] rounded-xl flex items-center justify-center mb-6">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 mb-2">Creator Sign In</CardTitle>
            <p className="text-slate-600">Welcome back! Sign in to your creator account</p>
          </CardHeader>
          <CardContent className="px-6 pb-8">
            <div className="text-center space-y-4">
              <p className="text-sm text-slate-500">
                Sign in functionality will be implemented with your Go backend
              </p>
              <Button asChild className="w-full bg-[#013f5c] hover:bg-[#024a6b] text-white px-6 py-3 rounded-lg font-medium transition-colors">
                <Link href="/creator/dashboard">
                  Continue to Dashboard (Demo)
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
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <Card className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-sm">
          <CardHeader className="text-center px-6 py-8 relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAuthMode('choose')}
              className="absolute left-4 top-4 hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="mx-auto w-16 h-16 bg-[#013f5c] rounded-xl flex items-center justify-center mb-6">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 mb-2">Create Creator Account</CardTitle>
            <p className="text-slate-600">Join our creator program and start building surveys</p>
          </CardHeader>
          <CardContent className="px-6 pb-8">
            <div className="text-center space-y-4">
              <p className="text-sm text-slate-500">
                New user registration will redirect to onboarding
              </p>
              <Button asChild className="w-full bg-[#013f5c] hover:bg-[#024a6b] text-white px-6 py-3 rounded-lg font-medium transition-colors">
                <Link href="/creator/onboarding">
                  Start Onboarding Process
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <Card className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-sm">
        <CardHeader className="text-center px-6 py-8 relative">
          <Button asChild variant="ghost" size="sm" className="absolute left-4 top-4 hover:bg-slate-100">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="mx-auto w-16 h-16 bg-[#013f5c] rounded-xl flex items-center justify-center mb-6">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 mb-2">Creator Portal</CardTitle>
          <p className="text-slate-600">Sign in or create your creator account</p>
        </CardHeader>
        <CardContent className="px-6 pb-8 space-y-4">
          <Button 
            onClick={() => setAuthMode('signin')}
            variant="outline" 
            className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            I have an account - Sign In
          </Button>
          <Button 
            onClick={() => setAuthMode('signup')}
            className="w-full bg-[#013f5c] hover:bg-[#024a6b] text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            I'm new here - Sign Up
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
