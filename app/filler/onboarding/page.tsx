"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/providers/auth-provider"

export default function FillerOnboardingPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    age: "",
    gender: "",
    country: "",
    state: "",
    education: "",
    employment: "",
    income: "",
    interests: [] as string[]
  })
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Create new user
      const newUser = {
        id: `filler-${Date.now()}`,
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        role: "filler" as const,
        isVerified: true
      }

      // Sign in the user
      signIn(newUser)
      
      // Redirect to filler dashboard
      router.push("/filler")
    } catch (error) {
      console.error("Registration failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInterestChange = (interest: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      interests: checked 
        ? [...prev.interests, interest]
        : prev.interests.filter(i => i !== interest)
    }))
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <img src="/Logo.png" alt="Onetime Survey" className="h-16 w-auto mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Complete your profile</h1>
          <p className="text-slate-600">Help us match you with relevant surveys</p>
        </div>

        <Card className="w-full">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">First name</label>
                  <Input 
                    placeholder="Enter first name" 
                    className="h-11 border-blue-200 focus:border-[#013F5C]"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Last name</label>
                  <Input 
                    placeholder="Enter last name" 
                    className="h-11 border-blue-200 focus:border-[#013F5C]"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <Input 
                  type="email"
                  placeholder="Enter email address" 
                  className="h-11 border-blue-200 focus:border-[#013F5C]"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <Input 
                  type="password"
                  placeholder="Create password" 
                  className="h-11 border-blue-200 focus:border-[#013F5C]"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Age</label>
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
                  <label className="text-sm font-medium">Gender</label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Country</label>
              <Select>
                <SelectTrigger className="h-11 border-blue-200 focus:border-[#013F5C]">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nigeria">Nigeria</SelectItem>
                  <SelectItem value="ghana">Ghana</SelectItem>
                  <SelectItem value="kenya">Kenya</SelectItem>
                  <SelectItem value="south-africa">South Africa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">State</label>
              <Select>
                <SelectTrigger className="h-11 border-blue-200 focus:border-[#013F5C]">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="abia">Abia</SelectItem>
                  <SelectItem value="adamawa">Adamawa</SelectItem>
                  <SelectItem value="akwa-ibom">Akwa Ibom</SelectItem>
                  <SelectItem value="anambra">Anambra</SelectItem>
                  <SelectItem value="bauchi">Bauchi</SelectItem>
                  <SelectItem value="bayelsa">Bayelsa</SelectItem>
                  <SelectItem value="benue">Benue</SelectItem>
                  <SelectItem value="borno">Borno</SelectItem>
                  <SelectItem value="cross-river">Cross River</SelectItem>
                  <SelectItem value="delta">Delta</SelectItem>
                  <SelectItem value="ebonyi">Ebonyi</SelectItem>
                  <SelectItem value="edo">Edo</SelectItem>
                  <SelectItem value="ekiti">Ekiti</SelectItem>
                  <SelectItem value="enugu">Enugu</SelectItem>
                  <SelectItem value="gombe">Gombe</SelectItem>
                  <SelectItem value="imo">Imo</SelectItem>
                  <SelectItem value="jigawa">Jigawa</SelectItem>
                  <SelectItem value="kaduna">Kaduna</SelectItem>
                  <SelectItem value="kano">Kano</SelectItem>
                  <SelectItem value="katsina">Katsina</SelectItem>
                  <SelectItem value="kebbi">Kebbi</SelectItem>
                  <SelectItem value="kogi">Kogi</SelectItem>
                  <SelectItem value="kwara">Kwara</SelectItem>
                  <SelectItem value="lagos">Lagos</SelectItem>
                  <SelectItem value="nasarawa">Nasarawa</SelectItem>
                  <SelectItem value="niger">Niger</SelectItem>
                  <SelectItem value="ogun">Ogun</SelectItem>
                  <SelectItem value="ondo">Ondo</SelectItem>
                  <SelectItem value="osun">Osun</SelectItem>
                  <SelectItem value="oyo">Oyo</SelectItem>
                  <SelectItem value="plateau">Plateau</SelectItem>
                  <SelectItem value="rivers">Rivers</SelectItem>
                  <SelectItem value="sokoto">Sokoto</SelectItem>
                  <SelectItem value="taraba">Taraba</SelectItem>
                  <SelectItem value="yobe">Yobe</SelectItem>
                  <SelectItem value="zamfara">Zamfara</SelectItem>
                  <SelectItem value="abuja">FCT Abuja</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Education Level</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="secondary">Secondary School</SelectItem>
                  <SelectItem value="diploma">Diploma/Certificate</SelectItem>
                  <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                  <SelectItem value="master">Master's Degree</SelectItem>
                  <SelectItem value="phd">PhD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Employment Status</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select employment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employed">Employed</SelectItem>
                  <SelectItem value="self-employed">Self-employed</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="unemployed">Unemployed</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Monthly Income Range</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select income range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-50k">₦0 - ₦50,000</SelectItem>
                  <SelectItem value="50k-100k">₦50,000 - ₦100,000</SelectItem>
                  <SelectItem value="100k-200k">₦100,000 - ₦200,000</SelectItem>
                  <SelectItem value="200k-500k">₦200,000 - ₦500,000</SelectItem>
                  <SelectItem value="500k+">₦500,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>

              <div className="space-y-4">
                <label className="text-sm font-medium">Interests (Select all that apply)</label>
                <div className="grid grid-cols-2 gap-4">
                  {["Technology", "Fashion", "Food", "Travel", "Sports", "Music", "Movies", "Health"].map((interest) => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox 
                        id={interest} 
                        checked={formData.interests.includes(interest)}
                        onCheckedChange={(checked) => handleInterestChange(interest, checked as boolean)}
                      />
                      <label htmlFor={interest} className="text-sm">{interest}</label>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                type="submit"
                variant="filler" 
                className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Complete setup & view surveys"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}