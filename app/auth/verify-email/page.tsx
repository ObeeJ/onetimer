import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Mail } from "lucide-react"

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <img src="/Logo.png" alt="Onetime Survey" className="h-12 w-auto mx-auto" />
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-8 w-8 text-[#013F5C]" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Verify your email</CardTitle>
          <p className="text-slate-600">We've sent a verification link to your email</p>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-slate-600">
            Click the link in your email to verify your account and continue
          </p>
          <Link href="/auth/role-selection" className="block">
            <Button className="w-full bg-[#C1654B] hover:bg-[#a55440] h-11">
              Continue (Demo)
            </Button>
          </Link>
          <Button variant="outline" className="w-full h-11">
            Resend email
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}