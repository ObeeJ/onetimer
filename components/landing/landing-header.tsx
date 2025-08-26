"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Logo, LogoCompact } from "@/components/ui/logo"
import { Menu, X } from "lucide-react"

export default function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="relative z-50 border-b border-white/20 bg-white/10 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            {/* Show compact logo on mobile, full logo on larger screens */}
            <div className="block sm:hidden">
              <LogoCompact 
                size="sm" 
                href="/" 
                priority={true}
              />
            </div>
            <div className="hidden sm:block">
              <Logo 
                size="lg" 
                showText={true} 
                href="/" 
                textClassName="text-white"
                className="text-white"
                priority={true}
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-4">
            <Button 
              asChild 
              variant="ghost" 
              className="min-h-[48px] px-4 py-2 text-white hover:bg-white/10"
            >
              <Link href="/filler/auth/sign-in">Sign In</Link>
            </Button>
            <Button
              asChild
              className="min-h-[48px] px-4 py-2 rounded-lg bg-white text-[#013f5c] font-medium hover:bg-gray-100"
            >
              <Link href="/filler/auth/sign-up">Sign Up</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden">
            <div className="border-t border-white/20 px-2 pb-3 pt-2 space-y-1">
              <Button 
                asChild 
                variant="ghost" 
                className="w-full justify-start text-white hover:bg-white/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link href="/filler/auth/sign-in">Sign In</Link>
              </Button>
              <Button
                asChild
                className="w-full justify-start bg-white text-[#013f5c] font-medium hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link href="/filler/auth/sign-up">Sign Up</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
