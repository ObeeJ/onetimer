"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Users, Wallet, CheckCircle, Menu, X } from "lucide-react"
import { AnimatedLogo } from "@/components/ui/animated-logo"
import { AnimatedBackground } from "@/components/ui/animated-background"
import { Footer } from "@/components/ui/footer"
import { cn } from "@/lib/utils"

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <AnimatedBackground />
      {/* Navigation */}
      <nav className="border-b border-slate-200 relative z-10 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <AnimatedLogo className="h-10 w-auto sm:h-8" />
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/pricing">
                <Button variant="ghost" className="navbar-item text-slate-600 hover:text-slate-900">
                  Pricing
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="ghost" className="navbar-item text-slate-600 hover:text-slate-900">
                  Sign in
                </Button>
              </Link>
              <Link href="/auth/role-selection">
                <Button className="bg-[#013F5C] hover:bg-[#012d42] text-white hover:shadow-lg">
                  Get started
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className={cn(
            "md:hidden transition-all duration-300 ease-in-out overflow-hidden",
            mobileMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
          )}>
            <div className="py-4 space-y-2 border-t border-slate-200 mt-4">
              <Link href="/pricing" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-slate-900">
                  Pricing
                </Button>
              </Link>
              <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-slate-900">
                  Sign in
                </Button>
              </Link>
              <Link href="/auth/role-selection" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-[#013F5C] hover:bg-[#012d42] text-white hover:shadow-lg mt-2">
                  Get started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 fade-in-up">
            Earn money sharing
            <span className="text-[#013F5C] block">your opinions</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto fade-in-up" style={{animationDelay: '0.2s'}}>
            Join thousands of Nigerians earning ₦200-1,500 per survey. Your voice matters, and we pay for it.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center fade-in-up" style={{animationDelay: '0.4s'}}>
            <Link href="/auth/role-selection">
              <Button size="lg" className="bg-[#013F5C] hover:bg-[#012d42] text-white px-8 py-4 text-lg font-semibold group pulse-cta hover:shadow-xl">
                Start earning now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-4 text-lg hover:shadow-md">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="fade-in-up" style={{animationDelay: '0.1s'}}>
              <div className="text-3xl font-bold text-[#013F5C] mb-2">50,000+</div>
              <div className="text-slate-600">Active users</div>
            </div>
            <div className="fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="text-3xl font-bold text-[#013F5C] mb-2">₦2M+</div>
              <div className="text-slate-600">Paid out</div>
            </div>
            <div className="fade-in-up" style={{animationDelay: '0.3s'}}>
              <div className="text-3xl font-bold text-[#013F5C] mb-2">10,000+</div>
              <div className="text-slate-600">Surveys completed</div>
            </div>
            <div className="fade-in-up" style={{animationDelay: '0.4s'}}>
              <div className="text-3xl font-bold text-[#013F5C] mb-2">4.9/5</div>
              <div className="text-slate-600">User rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How it works</h2>
            <p className="text-xl text-slate-600">Three simple steps to start earning</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center card-hover p-6 rounded-xl bg-white shadow-sm">
              <div className="w-16 h-16 bg-[#013F5C] rounded-full flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">1. Sign up</h3>
              <p className="text-slate-600">Create your account and complete your profile in under 2 minutes</p>
            </div>
            <div className="text-center card-hover p-6 rounded-xl bg-white shadow-sm">
              <div className="w-16 h-16 bg-[#013F5C] rounded-full flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">2. Take surveys</h3>
              <p className="text-slate-600">Answer questions about products and services you use daily</p>
            </div>
            <div className="text-center card-hover p-6 rounded-xl bg-white shadow-sm">
              <div className="w-16 h-16 bg-[#013F5C] rounded-full flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform">
                <Wallet className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">3. Get paid</h3>
              <p className="text-slate-600">Withdraw your earnings instantly to your bank account</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Ready to start earning?
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Join Nigeria's most trusted survey platform today
          </p>
          <Link href="/auth/role-selection">
            <Button size="lg" className="bg-[#013F5C] hover:bg-[#012d42] text-white px-8 py-4 text-lg font-semibold group hover:shadow-xl pulse-cta">
              Get started for free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}