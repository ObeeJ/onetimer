import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, BarChart3, Shield, Zap } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <img src="/Logo.png" alt="OneTime Survey" className="h-20 w-auto mx-auto mb-8" />
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            Nigeria's #1 Survey Platform
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Earn money by sharing your opinions or create surveys to collect valuable insights from our community.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-[#013F5C] hover:bg-[#0b577a] text-lg px-8 py-3">
              <Link href="/filler/auth/sign-up">
                <Users className="h-5 w-5 mr-2" />
                Join as Survey Filler
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-[#C1654B] text-[#C1654B] hover:bg-[#C1654B] hover:text-white text-lg px-8 py-3">
              <Link href="/creator/auth/sign-up">
                <BarChart3 className="h-5 w-5 mr-2" />
                Create Surveys
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>For Survey Fillers</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                Earn ₦200-1,500 per survey by sharing your opinions on products, services, and trends.
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Quick 5-15 minute surveys</li>
                <li>• Instant payments via bank transfer</li>
                <li>• Referral bonuses available</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>For Survey Creators</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                Create targeted surveys and collect insights from our verified community of respondents.
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Advanced targeting options</li>
                <li>• Real-time analytics dashboard</li>
                <li>• Export data in multiple formats</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Trusted & Secure</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                Your data is protected with enterprise-grade security and privacy measures.
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Verified user community</li>
                <li>• Secure payment processing</li>
                <li>• GDPR compliant platform</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Badge variant="secondary" className="mb-4">
            <Zap className="h-4 w-4 mr-1" />
            50,000+ Active Users
          </Badge>
          <p className="text-slate-600">
            Join thousands of Nigerians already earning and creating on our platform
          </p>
        </div>
      </div>
    </div>
  )
}