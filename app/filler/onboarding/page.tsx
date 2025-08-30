"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    location: "",
    occupation: "",
    interests: [] as string[],
    notifications: true
  })
  const router = useRouter()

  const totalSteps = 3
  const progress = (step / totalSteps) * 100

  const interests = [
    "Technology", "Shopping", "Food & Dining", "Travel", "Healthcare",
    "Entertainment", "Sports", "Fashion", "Finance", "Education"
  ]

  const handleInterestChange = (interest: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      interests: checked 
        ? [...prev.interests, interest]
        : prev.interests.filter(i => i !== interest)
    }))
  }

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      // TODO: Submit onboarding data to API
      router.push("/filler")
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Tell us about yourself</h2>
              <p className="text-slate-600">This helps us match you with relevant surveys</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Select value={formData.age} onValueChange={(value) => setFormData(prev => ({ ...prev, age: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select age range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="18-24">18-24</SelectItem>
                    <SelectItem value="25-34">25-34</SelectItem>
                    <SelectItem value="35-44">35-44</SelectItem>
                    <SelectItem value="45-54">45-54</SelectItem>
                    <SelectItem value="55+">55+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="City, Country"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                placeholder="Your current occupation"
                value={formData.occupation}
                onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">What interests you?</h2>
              <p className="text-slate-600">Select topics you'd like to share opinions about</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {interests.map((interest) => (
                <div key={interest} className="flex items-center space-x-2">
                  <Checkbox
                    id={interest}
                    checked={formData.interests.includes(interest)}
                    onCheckedChange={(checked) => handleInterestChange(interest, checked as boolean)}
                  />
                  <Label htmlFor={interest} className="text-sm font-medium">
                    {interest}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-900">You&apos;re all set!</h2>
              <p className="text-slate-600">Your profile is complete and you can start earning</p>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-slate-900">What&apos;s next?</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Browse available surveys on your dashboard</li>
                <li>• Complete surveys to earn money</li>
                <li>• Refer friends to earn bonus rewards</li>
                <li>• Track your earnings and request payouts</li>
              </ul>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="notifications"
                checked={formData.notifications}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notifications: checked as boolean }))}
              />
              <Label htmlFor="notifications" className="text-sm">
                Send me notifications about new surveys and earnings
              </Label>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/Logo.png" alt="OneTime Survey" className="h-16 w-auto mx-auto mb-4" />
        </div>
        
        <Card className="w-full">
          <CardHeader>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Step {step} of {totalSteps}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardHeader>
          <CardContent>
            {renderStep()}
            
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              
              <Button
                onClick={handleNext}
                className="bg-[#013F5C] hover:bg-[#0b577a] flex items-center gap-2"
              >
                {step === totalSteps ? "Get Started" : "Next"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}