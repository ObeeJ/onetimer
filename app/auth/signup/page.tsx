"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AnimatedBackground } from "@/components/ui/animated-background"

export default function SignUpPage() {
  const router = useRouter()

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
          <CardTitle className="text-2xl font-bold text-slate-900">Join Onetime Survey</CardTitle>
          <p className="text-slate-600">Choose how you want to get started</p>
        </CardHeader>
        <CardContent className="px-6 pb-6 space-y-6">
          <Link href="/auth/role-selection" className="block">
            <Button className="w-full bg-[#013F5C] hover:bg-[#012d42] h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all">
              Get Started
            </Button>
          </Link>
          <div className="text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-[#013F5C] hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}