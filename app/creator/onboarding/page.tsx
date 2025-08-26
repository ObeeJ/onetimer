"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Users,
  BarChart3,
  CreditCard,
  Target,
  TrendingUp,
  Shield,
  Building2,
  GraduationCap,
  User,
  Briefcase,
  BookOpen,
  FileText
} from "lucide-react"

const features = [
  {
    icon: <Users className="h-6 w-6" />,
    title: "Reach Your Audience",
    description: "Connect with thousands of verified Nigerian respondents across all demographics."
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Real-time Analytics",
    description: "Track responses in real-time with comprehensive analytics and insights."
  },
  {
    icon: <Target className="h-6 w-6" />,
    title: "Smart Targeting",
    description: "Target specific demographics, locations, and interests for better quality responses."
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: "Export & Analyze",
    description: "Export your data in CSV or JSON format for further analysis."
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Quality Assurance",
    description: "All responses are verified and quality-checked for authenticity."
  },
  {
    icon: <CreditCard className="h-6 w-6" />,
    title: "Pay-per-Response",
    description: "Only pay for completed responses. No hidden fees or subscriptions."
  }
]

const creatorCategories = [
  {
    id: 'business_owner',
    title: 'Business Owner',
    description: 'I own or manage a business and need market research',
    icon: <Building2 className="h-6 w-6" />,
    color: 'bg-blue-500'
  },
  {
    id: 'researcher',
    title: 'Researcher',
    description: 'I conduct academic or professional research',
    icon: <BookOpen className="h-6 w-6" />,
    color: 'bg-green-500'
  },
  {
    id: 'data_analyst',
    title: 'Data Analyst',
    description: 'I analyze data and need survey insights',
    icon: <BarChart3 className="h-6 w-6" />,
    color: 'bg-purple-500'
  },
  {
    id: 'student',
    title: 'Student',
    description: 'I need data for academic projects or thesis',
    icon: <GraduationCap className="h-6 w-6" />,
    color: 'bg-orange-500'
  },
  {
    id: 'consultant',
    title: 'Consultant',
    description: 'I provide consulting services and need market data',
    icon: <Briefcase className="h-6 w-6" />,
    color: 'bg-indigo-500'
  },
  {
    id: 'other',
    title: 'Other',
    description: 'My role doesn\'t fit the above categories',
    icon: <User className="h-6 w-6" />,
    color: 'bg-gray-500'
  }
]

export default function CreatorOnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    
    // Category (Required)
    category: '',
    
    // Optional Details
    companyName: '',
    businessType: '',
    website: '',
    schoolName: '',
    course: '',
    yearOfStudy: '',
    nin: '',
    
    // Verification
    profilePicture: null as File | null,
    idDocument: null as File | null,
  })

  const steps = [
    { title: "Welcome", description: "Learn about our platform" },
    { title: "Personal Info", description: "Basic information" },
    { title: "Category", description: "Choose your role" },
    { title: "Details", description: "Additional information" },
    { title: "Verification", description: "Verify your identity" },
    { title: "Complete", description: "Start creating surveys" }
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    // Save onboarding data and redirect to dashboard
    console.log('Onboarding completed:', formData)
    localStorage.setItem('creator-onboarding-completed', 'true')
    router.push('/creator/dashboard')
  }

  // Step 0: Welcome
  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Welcome to OneTime Survey Creator
            </h1>
            <p className="text-xl text-slate-600">
              Let's get you set up to start creating powerful surveys
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-[#013f5c] rounded-lg flex items-center justify-center text-white mb-3">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button onClick={nextStep} size="lg" className="bg-[#013f5c] hover:bg-[#012a3d]">
              Get Started
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Step 1: Personal Information
  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={prevStep}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Badge variant="secondary">Step 1 of 5</Badge>
            </div>
            <CardTitle>Personal Information</CardTitle>
            <p className="text-sm text-slate-600">Tell us about yourself</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="+234 806 123 4567"
                required
              />
            </div>
            <Button 
              onClick={nextStep} 
              className="w-full bg-[#013f5c] hover:bg-[#012a3d]"
              disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phoneNumber}
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Step 2: Category Selection (Required)
  if (currentStep === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={prevStep}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Badge variant="secondary">Step 2 of 5</Badge>
              </div>
              <CardTitle className="text-center">Choose Your Category</CardTitle>
              <p className="text-sm text-slate-600 text-center">
                This helps us customize your experience (Required)
              </p>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
                className="grid md:grid-cols-2 gap-4"
              >
                {creatorCategories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={category.id} id={category.id} />
                    <Label 
                      htmlFor={category.id} 
                      className="flex-1 cursor-pointer p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
                          {category.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{category.title}</h3>
                          <p className="text-sm text-slate-600">{category.description}</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <div className="mt-6">
                <Button 
                  onClick={nextStep} 
                  className="w-full bg-[#013f5c] hover:bg-[#012a3d]"
                  disabled={!formData.category}
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Step 3: Optional Details
  if (currentStep === 3) {
    const isBusinessOwner = formData.category === 'business_owner'
    const isStudent = formData.category === 'student'

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={prevStep}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Badge variant="secondary">Step 3 of 5</Badge>
            </div>
            <CardTitle>Additional Details</CardTitle>
            <p className="text-sm text-slate-600">
              Optional information (you can complete this later in your profile)
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {isBusinessOwner && (
              <>
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="ABC Research Ltd"
                  />
                </div>
                <div>
                  <Label htmlFor="businessType">Business Type</Label>
                  <Input
                    id="businessType"
                    value={formData.businessType}
                    onChange={(e) => handleInputChange('businessType', e.target.value)}
                    placeholder="Market Research, Consulting, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://www.company.com"
                  />
                </div>
              </>
            )}

            {isStudent && (
              <>
                <div>
                  <Label htmlFor="schoolName">School/University</Label>
                  <Input
                    id="schoolName"
                    value={formData.schoolName}
                    onChange={(e) => handleInputChange('schoolName', e.target.value)}
                    placeholder="University of Lagos"
                  />
                </div>
                <div>
                  <Label htmlFor="course">Course of Study</Label>
                  <Input
                    id="course"
                    value={formData.course}
                    onChange={(e) => handleInputChange('course', e.target.value)}
                    placeholder="Computer Science"
                  />
                </div>
                <div>
                  <Label htmlFor="yearOfStudy">Year of Study</Label>
                  <Input
                    id="yearOfStudy"
                    value={formData.yearOfStudy}
                    onChange={(e) => handleInputChange('yearOfStudy', e.target.value)}
                    placeholder="3rd Year"
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="nin">National Identification Number (NIN)</Label>
              <Input
                id="nin"
                value={formData.nin}
                onChange={(e) => handleInputChange('nin', e.target.value)}
                placeholder="Optional - for verification"
              />
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={nextStep} 
                className="flex-1"
              >
                Skip for Now
              </Button>
              <Button 
                onClick={nextStep} 
                className="flex-1 bg-[#013f5c] hover:bg-[#012a3d]"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Step 4: Verification
  if (currentStep === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={prevStep}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Badge variant="secondary">Step 4 of 5</Badge>
            </div>
            <CardTitle>Verification</CardTitle>
            <p className="text-sm text-slate-600">
              Upload documents for account verification (optional but recommended)
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="profilePicture">Profile Picture</Label>
              <Input
                id="profilePicture"
                type="file"
                accept="image/*"
                onChange={(e) => handleInputChange('profilePicture', e.target.files?.[0] || null)}
              />
              <p className="text-xs text-slate-500 mt-1">Clear photo of yourself</p>
            </div>
            
            <div>
              <Label htmlFor="idDocument">ID Document</Label>
              <Input
                id="idDocument"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleInputChange('idDocument', e.target.files?.[0] || null)}
              />
              <p className="text-xs text-slate-500 mt-1">
                Driver's License, NIN slip, or International Passport
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <FileText className="h-4 w-4 inline mr-2" />
                Verification helps build trust and may unlock additional features
              </p>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={nextStep} 
                className="flex-1"
              >
                Skip Verification
              </Button>
              <Button 
                onClick={nextStep} 
                className="flex-1 bg-[#013f5c] hover:bg-[#012a3d]"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Step 5: Complete
  if (currentStep === 5) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Welcome to OneTime Survey!</CardTitle>
            <p className="text-slate-600">Your creator account is ready</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">What's next?</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Create your first survey</li>
                <li>• Set up targeting and demographics</li>
                <li>• Launch and start collecting responses</li>
                <li>• Monitor real-time analytics</li>
              </ul>
            </div>
            
            <Button 
              onClick={handleComplete} 
              className="w-full bg-[#013f5c] hover:bg-[#012a3d]"
            >
              Go to Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
