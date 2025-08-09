"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ProfileForm from "@/components/onboarding/profile-form"
import KYCUpload from "@/components/onboarding/kyc-upload"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/hooks/use-auth"

export default function OnboardingPage() {
  const [step, setStep] = useState<1 | 2>(1)
  const { signIn } = useAuth()

  const percent = step === 1 ? 50 : 100

  return (
    <div className="container mx-auto flex max-w-2xl flex-col gap-4 p-4 md:p-6">
      <Card className="rounded-2xl border-slate-200 bg-white/70 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Onboarding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span className={step === 1 ? "text-[#013F5C]" : ""}>1. Profile</span>
              <span className={step === 2 ? "text-[#013F5C]" : ""}>2. NIN/BVN KYC</span>
            </div>
            <Progress value={percent} />
          </div>

          {step === 1 ? <ProfileForm /> : <KYCUpload />}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(1)} disabled={step === 1} className="rounded-2xl">
            Back
          </Button>
          {step === 1 ? (
            <Button
              onClick={() => setStep(2)}
              size="lg"
              className="h-11 rounded-2xl bg-[#013F5C] text-white hover:bg-[#0b577a]"
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={() => {
                // After onboarding, sign in the user and go to Dashboard.
                signIn({ id: "u_" + Date.now(), name: "OneTimer" })
                window.location.href = "/filler"
              }}
              size="lg"
              className="h-11 rounded-2xl bg-[#C1654B] text-white hover:bg-[#b25a43]"
            >
              Finish
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
