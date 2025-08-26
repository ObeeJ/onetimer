"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Users, 
  MapPin, 
  Calendar, 
  Briefcase, 
  GraduationCap,
  Heart,
  DollarSign,
  Target,
  Info,
  Plus,
  X
} from "lucide-react"
import type { DemographicsTarget } from "@/types/creator"

interface DemographicsTargetingProps {
  demographics: DemographicsTarget
  onUpdate: (demographics: DemographicsTarget) => void
  estimatedReach?: number
  loading?: boolean
}

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers",
  "Sokoto", "Taraba", "Yobe", "Zamfara", "FCT"
]

const AGE_RANGES = [
  { value: "18-24", label: "18-24 years" },
  { value: "25-34", label: "25-34 years" },
  { value: "35-44", label: "35-44 years" },
  { value: "45-54", label: "45-54 years" },
  { value: "55-64", label: "55-64 years" },
  { value: "65+", label: "65+ years" }
]

const EDUCATION_LEVELS = [
  { value: "primary", label: "Primary Education" },
  { value: "secondary", label: "Secondary Education" },
  { value: "tertiary", label: "Tertiary Education" },
  { value: "postgraduate", label: "Postgraduate" }
]

const EMPLOYMENT_STATUS = [
  { value: "employed", label: "Employed" },
  { value: "self_employed", label: "Self-employed" },
  { value: "unemployed", label: "Unemployed" },
  { value: "student", label: "Student" },
  { value: "retired", label: "Retired" }
]

const INCOME_RANGES = [
  { value: "0-50k", label: "₦0 - ₦50,000" },
  { value: "50k-100k", label: "₦50,000 - ₦100,000" },
  { value: "100k-250k", label: "₦100,000 - ₦250,000" },
  { value: "250k-500k", label: "₦250,000 - ₦500,000" },
  { value: "500k-1m", label: "₦500,000 - ₦1,000,000" },
  { value: "1m+", label: "₦1,000,000+" }
]

const MARITAL_STATUS = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" }
]

export function DemographicsTargeting({ 
  demographics, 
  onUpdate, 
  estimatedReach,
  loading = false 
}: DemographicsTargetingProps) {
  const [customInterest, setCustomInterest] = useState("")

  const updateField = <K extends keyof DemographicsTarget>(
    field: K, 
    value: DemographicsTarget[K]
  ) => {
    onUpdate({ ...demographics, [field]: value })
  }

  const toggleArrayItem = <K extends keyof DemographicsTarget>(
    field: K,
    item: string
  ) => {
    const currentArray = (demographics[field] as string[]) || []
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item]
    
    updateField(field, newArray as DemographicsTarget[K])
  }

  const addCustomInterest = () => {
    if (!customInterest.trim()) return
    
    const currentInterests = demographics.interests || []
    const newInterests = [...currentInterests, customInterest.trim()]
    updateField('interests', newInterests)
    setCustomInterest("")
  }

  const removeInterest = (interest: string) => {
    const currentInterests = demographics.interests || []
    const newInterests = currentInterests.filter(i => i !== interest)
    updateField('interests', newInterests)
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="rounded-2xl border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Target className="h-6 w-6 text-[#013F5C]" />
                Demographics Targeting
              </CardTitle>
              <p className="text-slate-600 mt-2">
                Define your target audience to get better responses and insights
              </p>
            </div>
            
            {estimatedReach !== undefined && (
              <div className="text-right">
                <div className="text-2xl font-bold text-[#013F5C]">
                  {estimatedReach.toLocaleString()}
                </div>
                <div className="text-sm text-slate-600">Estimated Reach</div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Smart Targeting</h4>
                <p className="text-sm text-blue-700">
                  The more specific your targeting, the higher quality responses you'll receive. 
                  Less specific targeting means wider reach but potentially less relevant responses.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Demographics */}
      <Card className="rounded-xl border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Basic Demographics
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Gender */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Gender</Label>
            <div className="flex flex-wrap gap-3">
              {["male", "female", "other"].map((gender) => (
                <div key={gender} className="flex items-center space-x-2">
                  <Checkbox
                    id={`gender-${gender}`}
                    checked={demographics.gender?.includes(gender) || false}
                    onCheckedChange={() => toggleArrayItem('gender', gender)}
                  />
                  <Label htmlFor={`gender-${gender}`} className="text-sm capitalize">
                    {gender}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Age Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Age Range</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {AGE_RANGES.map((age) => (
                <div key={age.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`age-${age.value}`}
                    checked={demographics.ageRange?.includes(age.value) || false}
                    onCheckedChange={() => toggleArrayItem('ageRange', age.value)}
                  />
                  <Label htmlFor={`age-${age.value}`} className="text-sm">
                    {age.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card className="rounded-xl border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* States */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">States (Nigeria)</Label>
            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {NIGERIAN_STATES.map((state) => (
                  <div key={state} className="flex items-center space-x-2">
                    <Checkbox
                      id={`state-${state}`}
                      checked={demographics.location?.includes(state) || false}
                      onCheckedChange={() => toggleArrayItem('location', state)}
                    />
                    <Label htmlFor={`state-${state}`} className="text-sm">
                      {state}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Leave empty to target all locations
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Education & Employment */}
      <Card className="rounded-xl border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Education & Employment
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Education Level */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Education Level</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {EDUCATION_LEVELS.map((edu) => (
                <div key={edu.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`education-${edu.value}`}
                    checked={demographics.education?.includes(edu.value) || false}
                    onCheckedChange={() => toggleArrayItem('education', edu.value)}
                  />
                  <Label htmlFor={`education-${edu.value}`} className="text-sm">
                    {edu.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Employment Status */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Employment Status</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {EMPLOYMENT_STATUS.map((emp) => (
                <div key={emp.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`employment-${emp.value}`}
                    checked={demographics.employment?.includes(emp.value) || false}
                    onCheckedChange={() => toggleArrayItem('employment', emp.value)}
                  />
                  <Label htmlFor={`employment-${emp.value}`} className="text-sm">
                    {emp.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Income & Lifestyle */}
      <Card className="rounded-xl border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Income & Lifestyle
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Income Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Monthly Income Range</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {INCOME_RANGES.map((income) => (
                <div key={income.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`income-${income.value}`}
                    checked={demographics.income?.includes(income.value) || false}
                    onCheckedChange={() => toggleArrayItem('income', income.value)}
                  />
                  <Label htmlFor={`income-${income.value}`} className="text-sm">
                    {income.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Marital Status */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Marital Status</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {MARITAL_STATUS.map((status) => (
                <div key={status.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`marital-${status.value}`}
                    checked={demographics.maritalStatus?.includes(status.value) || false}
                    onCheckedChange={() => toggleArrayItem('maritalStatus', status.value)}
                  />
                  <Label htmlFor={`marital-${status.value}`} className="text-sm">
                    {status.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interests */}
      <Card className="rounded-xl border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Interests & Preferences
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Current Interests */}
          {demographics.interests && demographics.interests.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Selected Interests</Label>
              <div className="flex flex-wrap gap-2">
                {demographics.interests.map((interest, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 px-3 py-1"
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => removeInterest(interest)}
                      className="text-slate-500 hover:text-red-600 ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Add Custom Interest */}
          <div className="space-y-2">
            <Label htmlFor="custom-interest" className="text-sm font-medium">
              Add Custom Interest
            </Label>
            <div className="flex gap-2">
              <Input
                id="custom-interest"
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                placeholder="e.g., Technology, Sports, Music..."
                className="rounded-xl"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addCustomInterest()
                  }
                }}
              />
              <Button
                type="button"
                onClick={addCustomInterest}
                disabled={!customInterest.trim()}
                className="rounded-xl bg-[#013F5C] hover:bg-[#0b577a]"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              Press Enter or click + to add interests. These help match respondents with relevant topics.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="rounded-xl border-slate-200/60 bg-gradient-to-r from-[#013F5C] to-[#0b577a] text-white">
        <CardContent className="p-6">
          <div className="text-center space-y-3">
            <h3 className="text-lg font-semibold">Targeting Summary</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">
                  {demographics.gender?.length || 0}/3
                </div>
                <div className="text-sm opacity-90">Gender</div>
              </div>
              
              <div>
                <div className="text-2xl font-bold">
                  {demographics.ageRange?.length || 0}/{AGE_RANGES.length}
                </div>
                <div className="text-sm opacity-90">Age Groups</div>
              </div>
              
              <div>
                <div className="text-2xl font-bold">
                  {demographics.location?.length || 0}/{NIGERIAN_STATES.length}
                </div>
                <div className="text-sm opacity-90">Locations</div>
              </div>
              
              <div>
                <div className="text-2xl font-bold">
                  {demographics.interests?.length || 0}
                </div>
                <div className="text-sm opacity-90">Interests</div>
              </div>
            </div>

            {estimatedReach !== undefined && (
              <div className="pt-3 border-t border-white/20">
                <p className="text-sm opacity-90">
                  With these criteria, you can reach approximately
                </p>
                <p className="text-xl font-bold">
                  {estimatedReach.toLocaleString()} potential respondents
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
