"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Building, 
  FileText, 
  User, 
  Mail, 
  Phone, 
  CheckCircle2, 
  Clock,
  AlertCircle,
  ArrowRight
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCreatorAuth } from "@/hooks/use-creator-auth"
import type { CreatorProfile } from "@/types/creator"

interface RegistrationFormData {
  companyName: string
  registrationNumber: string
  contactPerson: string
  email: string
  phone: string
  businessDescription: string
  website?: string
}

interface RegistrationFormProps {
  onSubmit: (data: RegistrationFormData) => Promise<void>
  loading?: boolean
}

export function RegistrationForm({ onSubmit, loading = false }: RegistrationFormProps) {
  const [formData, setFormData] = useState<RegistrationFormData>({
    companyName: "",
    registrationNumber: "",
    contactPerson: "",
    email: "",
    phone: "",
    businessDescription: "",
    website: ""
  })

  const [errors, setErrors] = useState<Partial<RegistrationFormData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<RegistrationFormData> = {}

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required"
    }

    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = "Registration number is required"
    }

    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = "Contact person is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    }

    if (!formData.businessDescription.trim()) {
      newErrors.businessDescription = "Business description is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error("Registration failed:", error)
    }
  }

  const handleInputChange = (field: keyof RegistrationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto rounded-2xl border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-slate-900">
          Join OneTime as a Survey Creator
        </CardTitle>
        <p className="text-slate-600 mt-2">
          Create professional surveys and collect valuable insights from verified respondents
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Building className="h-4 w-4" />
              Company Information
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange("companyName", e.target.value)}
                  placeholder="Your company or organization"
                  className="rounded-xl"
                  aria-invalid={!!errors.companyName}
                />
                {errors.companyName && (
                  <p className="text-sm text-red-600">{errors.companyName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Registration Number</Label>
                <Input
                  id="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
                  placeholder="CAC number or business ID"
                  className="rounded-xl"
                  aria-invalid={!!errors.registrationNumber}
                />
                {errors.registrationNumber && (
                  <p className="text-sm text-red-600">{errors.registrationNumber}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessDescription">Business Description</Label>
              <Textarea
                id="businessDescription"
                value={formData.businessDescription}
                onChange={(e) => handleInputChange("businessDescription", e.target.value)}
                placeholder="Briefly describe your business and why you need survey data"
                className="rounded-xl min-h-[80px]"
                aria-invalid={!!errors.businessDescription}
              />
              {errors.businessDescription && (
                <p className="text-sm text-red-600">{errors.businessDescription}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website (Optional)</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder="https://yourcompany.com"
                className="rounded-xl"
              />
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <User className="h-4 w-4" />
              Contact Information
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                placeholder="Full name of primary contact"
                className="rounded-xl"
                aria-invalid={!!errors.contactPerson}
              />
              {errors.contactPerson && (
                <p className="text-sm text-red-600">{errors.contactPerson}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="contact@company.com"
                  className="rounded-xl"
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+234 xxx xxx xxxx"
                  className="rounded-xl"
                  aria-invalid={!!errors.phone}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Verification Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Verification Process</h4>
                <p className="text-sm text-blue-700">
                  We'll review your application within 1-2 business days. You'll receive an email 
                  notification once your account is approved and ready to use.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="w-full rounded-xl bg-[#013F5C] hover:bg-[#0b577a] h-12 font-semibold"
          >
            {loading ? (
              "Submitting Application..."
            ) : (
              <>
                Submit for Verification
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>

          <div className="text-center text-xs text-slate-500">
            By registering, you agree to our{" "}
            <a href="#" className="text-[#013F5C] hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-[#013F5C] hover:underline">
              Privacy Policy
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

interface VerificationStatusProps {
  creator: CreatorProfile
}

export function VerificationStatus({ creator }: VerificationStatusProps) {
  const getStatusConfig = (status: CreatorProfile['status']) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'amber',
          title: 'Application Under Review',
          description: 'We\'re reviewing your application. You\'ll receive an email notification once approved.',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          textColor: 'text-amber-800',
          iconColor: 'text-amber-600'
        }
      case 'approved':
        return {
          icon: CheckCircle2,
          color: 'green',
          title: 'Account Approved',
          description: 'Congratulations! Your creator account has been approved. You can now create surveys.',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          iconColor: 'text-green-600'
        }
      case 'rejected':
        return {
          icon: AlertCircle,
          color: 'red',
          title: 'Application Rejected',
          description: 'Unfortunately, your application was not approved. Please contact support for more information.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600'
        }
      default:
        return {
          icon: Clock,
          color: 'slate',
          title: 'Status Unknown',
          description: 'Please contact support for assistance.',
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-200',
          textColor: 'text-slate-800',
          iconColor: 'text-slate-600'
        }
    }
  }

  const config = getStatusConfig(creator.status)
  const Icon = config.icon

  return (
    <Card className="w-full max-w-2xl mx-auto rounded-2xl border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-lg">
      <CardContent className="py-8">
        <div className={`${config.bgColor} ${config.borderColor} border rounded-xl p-6`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${config.bgColor} border ${config.borderColor}`}>
              <Icon className={`h-6 w-6 ${config.iconColor}`} />
            </div>
            
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${config.textColor} mb-2`}>
                {config.title}
              </h3>
              <p className={`text-sm ${config.textColor} opacity-90 mb-4`}>
                {config.description}
              </p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={config.textColor}>Company:</span>
                  <span className={`font-medium ${config.textColor}`}>{creator.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className={config.textColor}>Application Date:</span>
                  <span className={`font-medium ${config.textColor}`}>
                    {new Date(creator.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={config.textColor}>Status:</span>
                  <Badge 
                    variant={creator.status === 'approved' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {creator.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
