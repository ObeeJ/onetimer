"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, DollarSign, Users, TrendingUp, Shield, CheckCircle } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#013f5c] via-[#024a6b] to-[#015a7a]">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-[#C1654B] rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">OneTime Survey</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/creator/auth/sign-in" className="text-white/80 hover:text-white">
                Creator Login
              </Link>
              <Link href="/filler/auth/sign-in" className="text-white/80 hover:text-white">
                User Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Nigeria's #1 Survey Platform
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Connect researchers with respondents. Create surveys or earn money by taking them.
          </p>
          
          {/* Main CTAs */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
            {/* Get Survey CTA - For Creators */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-[#C1654B] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-white">Get Survey Data</CardTitle>
                <p className="text-white/80">For Researchers & Businesses</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-white/80 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-[#C1654B] mr-2" />
                    Create professional surveys
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-[#C1654B] mr-2" />
                    Target specific demographics
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-[#C1654B] mr-2" />
                    Get real-time analytics
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-[#C1654B] mr-2" />
                    Reach verified respondents
                  </li>
                </ul>
                <Button asChild size="lg" className="w-full bg-[#C1654B] hover:bg-[#a54d39] text-white">
                  <Link href="/creator/auth">
                    Start Creating Surveys
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Earn Online CTA - For Fillers */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-white">Earn Online</CardTitle>
                <p className="text-white/80">For Survey Respondents</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-white/80 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Take surveys and earn money
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Flexible working hours
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Instant payments
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Refer friends and earn more
                  </li>
                </ul>
                <Button asChild size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <Link href="/filler/auth">
                    Start Earning Today
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white/5">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Why Choose OneTime Survey?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Secure & Trusted</h3>
              <p className="text-white/80">Bank-level security for all transactions and data</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Verified Users</h3>
              <p className="text-white/80">Quality responses from verified Nigerian users</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Fast Results</h3>
              <p className="text-white/80">Get survey responses and insights quickly</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4">
        <div className="container mx-auto text-center text-white/60">
          <p>&copy; 2025 OneTime Survey. Nigeria's leading survey platform.</p>
        </div>
      </footer>
    </div>
  )
}
