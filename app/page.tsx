import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Building2, Shield, Crown } from "lucide-react"
import { RoleRedirect } from "@/components/role-selector"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <RoleRedirect />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <img src="/Logo.png" alt="OneTime Survey" className="h-20 w-auto mx-auto mb-8" />
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Welcome to OneTime Survey Platform
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Choose your role to access the platform. Earn money by completing surveys or create surveys to gather insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="rounded-xl hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Survey Filler</CardTitle>
              <p className="text-sm text-slate-600">Earn ₦200-1,500 per survey</p>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="text-sm text-slate-600 mb-6 space-y-2">
                <li>• Complete surveys and earn money</li>
                <li>• Track your earnings</li>
                <li>• Refer friends for bonuses</li>
                <li>• KYC verification required</li>
              </ul>
              <Link href="/filler" className="block">
                <Button className="w-full bg-[#013F5C] hover:bg-[#0b577a]">
                  Enter as Filler
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="rounded-xl hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 group-hover:bg-orange-200 transition-colors">
                <Building2 className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-xl">Survey Creator</CardTitle>
              <p className="text-sm text-slate-600">Create surveys for insights</p>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="text-sm text-slate-600 mb-6 space-y-2">
                <li>• Create and manage surveys</li>
                <li>• Target specific audiences</li>
                <li>• Real-time analytics</li>
                <li>• Credit-based pricing</li>
              </ul>
              <Link href="/creator" className="block">
                <Button className="w-full bg-[#C1654B] hover:bg-[#b25a43]">
                  Enter as Creator
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="rounded-xl hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 group-hover:bg-red-200 transition-colors">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-xl">Admin</CardTitle>
              <p className="text-sm text-slate-600">Platform management</p>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="text-sm text-slate-600 mb-6 space-y-2">
                <li>• User management</li>
                <li>• Survey moderation</li>
                <li>• Payment processing</li>
                <li>• Platform analytics</li>
              </ul>
              <a href="http://localhost:3001/admin" className="block">
                <Button className="w-full bg-[#013F5C] hover:bg-[#0b577a]">
                  Admin Access
                </Button>
              </a>
            </CardContent>
          </Card>

          <Card className="rounded-xl hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 group-hover:bg-purple-200 transition-colors">
                <Crown className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Super Admin</CardTitle>
              <p className="text-sm text-slate-600">System oversight</p>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="text-sm text-slate-600 mb-6 space-y-2">
                <li>• Admin management</li>
                <li>• System configuration</li>
                <li>• Financial oversight</li>
                <li>• Audit logs & security</li>
              </ul>
              <a href="http://localhost:3002/super-admin" className="block">
                <Button className="w-full bg-[#013F5C] hover:bg-[#0b577a]">
                  Super Admin Access
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-16">
          <p className="text-slate-600 mb-4">
            New to OneTime Survey? Learn more about our platform
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" className="border-[#013F5C] text-[#013F5C] hover:bg-[#013F5C] hover:text-white">
              How it Works
            </Button>
            <Button variant="outline" className="border-[#013F5C] text-[#013F5C] hover:bg-[#013F5C] hover:text-white">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}