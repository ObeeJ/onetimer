import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Users, Building2 } from "lucide-react"
import Image from "next/image"

export default function RoleSelectionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-12">
          <Image src="/Logo.png" alt="Onetime Survey" width={320} height={80} className="mx-auto mb-8" />
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Choose your path</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">Select how you want to use Onetime Survey and start your journey with us</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="relative overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group border-0 bg-white">
            <div className="absolute inset-0 bg-white group-hover:bg-slate-50 transition-all duration-300"></div>
            <CardHeader className="text-center pb-6 relative z-10">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="h-10 w-10 text-[#013F5C]" />
              </div>
              <CardTitle className="text-3xl font-bold text-slate-900 mb-2">Survey filler</CardTitle>
              <p className="text-lg font-semibold text-[#013F5C]">Earn ₦200-1,500 per survey</p>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              <ul className="text-slate-700 space-y-3 text-center">
                <li className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-[#013F5C] rounded-full"></div>
                  Complete surveys and earn money
                </li>
                <li className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-[#013F5C] rounded-full"></div>
                  Track your earnings
                </li>
                <li className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-[#013F5C] rounded-full"></div>
                  Refer friends for bonuses
                </li>
                <li className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-[#013F5C] rounded-full"></div>
                  Flexible working hours
                </li>
              </ul>
              <Link href="/filler/onboarding" className="block">
                <Button variant="filler" size="lg" className="w-full text-lg font-semibold group-hover:scale-105">
                  Start earning now
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group border-0 bg-white">
            <div className="absolute inset-0 bg-white group-hover:bg-slate-50 transition-all duration-300"></div>
            <CardHeader className="text-center pb-6 relative z-10">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Building2 className="h-10 w-10 text-[#C1654B]" />
              </div>
              <CardTitle className="text-3xl font-bold text-slate-900 mb-2">Survey creator</CardTitle>
              <p className="text-lg font-semibold text-[#C1654B]">Create surveys for insights</p>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              <ul className="text-slate-700 space-y-3 text-center">
                <li className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-[#C1654B] rounded-full"></div>
                  Create and manage surveys
                </li>
                <li className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-[#C1654B] rounded-full"></div>
                  Target specific audiences
                </li>
                <li className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-[#C1654B] rounded-full"></div>
                  Real-time analytics
                </li>
                <li className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-[#C1654B] rounded-full"></div>
                  Quality data collection
                </li>
              </ul>
              <Link href="/creator/onboarding" className="block">
                <Button variant="creator" size="lg" className="w-full text-lg font-semibold group-hover:scale-105">
                  Start creating surveys
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center mt-12">
          <p className="text-slate-500 text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[#C1654B] hover:underline font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}