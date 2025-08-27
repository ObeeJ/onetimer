"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingHeader() {
  return (
    <header className="relative z-50 border-b border-white/20 bg-white/10 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-white">
              OneTime Survey
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" className="min-h-[48px] px-4 py-2 text-white hover:bg-white/10">
              <Link href="/filler/auth/sign-in">Sign In</Link>
            </Button>
            <Button
              asChild
              className="min-h-[48px] px-4 py-2 rounded-lg bg-white text-[#013f5c] font-medium hover:bg-gray-100"
            >
              <Link href="/filler/auth/sign-up">Sign Up</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
