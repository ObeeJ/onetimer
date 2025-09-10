"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/providers/auth-provider"

const industryRoles = {
  technology: [
    { value: "software-engineer", label: "Software Engineer" },
    { value: "frontend-developer", label: "Frontend Developer" },
    { value: "backend-developer", label: "Backend Developer" },
    { value: "fullstack-developer", label: "Full Stack Developer" },
    { value: "mobile-developer", label: "Mobile Developer" },
    { value: "devops-engineer", label: "DevOps Engineer" },
    { value: "data-scientist", label: "Data Scientist" },
    { value: "data-analyst", label: "Data Analyst" },
    { value: "product-manager", label: "Product Manager" },
    { value: "ui-ux-designer", label: "UI/UX Designer" },
    { value: "system-administrator", label: "System Administrator" },
    { value: "cybersecurity-specialist", label: "Cybersecurity Specialist" },
    { value: "qa-engineer", label: "QA Engineer" },
    { value: "technical-writer", label: "Technical Writer" },
    { value: "it-support", label: "IT Support" },
    { value: "cto", label: "CTO" },
    { value: "engineering-manager", label: "Engineering Manager" }
  ],
  healthcare: [
    { value: "doctor", label: "Doctor" },
    { value: "nurse", label: "Nurse" },
    { value: "pharmacist", label: "Pharmacist" },
    { value: "medical-technician", label: "Medical Technician" },
    { value: "radiologist", label: "Radiologist" },
    { value: "surgeon", label: "Surgeon" },
    { value: "dentist", label: "Dentist" },
    { value: "physical-therapist", label: "Physical Therapist" },
    { value: "medical-researcher", label: "Medical Researcher" },
    { value: "hospital-administrator", label: "Hospital Administrator" },
    { value: "healthcare-analyst", label: "Healthcare Analyst" },
    { value: "medical-sales-rep", label: "Medical Sales Representative" },
    { value: "clinical-coordinator", label: "Clinical Coordinator" },
    { value: "lab-technician", label: "Lab Technician" },
    { value: "paramedic", label: "Paramedic" }
  ],
  finance: [
    { value: "financial-analyst", label: "Financial Analyst" },
    { value: "investment-banker", label: "Investment Banker" },
    { value: "accountant", label: "Accountant" },
    { value: "auditor", label: "Auditor" },
    { value: "financial-advisor", label: "Financial Advisor" },
    { value: "risk-manager", label: "Risk Manager" },
    { value: "portfolio-manager", label: "Portfolio Manager" },
    { value: "credit-analyst", label: "Credit Analyst" },
    { value: "insurance-agent", label: "Insurance Agent" },
    { value: "tax-consultant", label: "Tax Consultant" },
    { value: "financial-planner", label: "Financial Planner" },
    { value: "compliance-officer", label: "Compliance Officer" },
    { value: "treasury-analyst", label: "Treasury Analyst" },
    { value: "banking-officer", label: "Banking Officer" },
    { value: "loan-officer", label: "Loan Officer" }
  ],
  education: [
    { value: "teacher", label: "Teacher" },
    { value: "professor", label: "Professor" },
    { value: "principal", label: "Principal" },
    { value: "academic-researcher", label: "Academic Researcher" },
    { value: "curriculum-developer", label: "Curriculum Developer" },
    { value: "education-administrator", label: "Education Administrator" },
    { value: "school-counselor", label: "School Counselor" },
    { value: "librarian", label: "Librarian" },
    { value: "teaching-assistant", label: "Teaching Assistant" },
    { value: "education-consultant", label: "Education Consultant" },
    { value: "training-specialist", label: "Training Specialist" },
    { value: "instructional-designer", label: "Instructional Designer" },
    { value: "student-affairs-officer", label: "Student Affairs Officer" }
  ],
  retail: [
    { value: "sales-associate", label: "Sales Associate" },
    { value: "store-manager", label: "Store Manager" },
    { value: "merchandiser", label: "Merchandiser" },
    { value: "buyer", label: "Buyer" },
    { value: "inventory-manager", label: "Inventory Manager" },
    { value: "customer-service-rep", label: "Customer Service Representative" },
    { value: "visual-merchandiser", label: "Visual Merchandiser" },
    { value: "regional-manager", label: "Regional Manager" },
    { value: "ecommerce-manager", label: "E-commerce Manager" },
    { value: "supply-chain-coordinator", label: "Supply Chain Coordinator" },
    { value: "marketing-coordinator", label: "Marketing Coordinator" },
    { value: "loss-prevention-officer", label: "Loss Prevention Officer" }
  ],
  government: [
    { value: "civil-servant", label: "Civil Servant" },
    { value: "policy-analyst", label: "Policy Analyst" },
    { value: "public-administrator", label: "Public Administrator" },
    { value: "government-consultant", label: "Government Consultant" },
    { value: "regulatory-affairs-specialist", label: "Regulatory Affairs Specialist" },
    { value: "public-relations-officer", label: "Public Relations Officer" },
    { value: "social-worker", label: "Social Worker" },
    { value: "urban-planner", label: "Urban Planner" },
    { value: "tax-officer", label: "Tax Officer" },
    { value: "immigration-officer", label: "Immigration Officer" },
    { value: "legal-advisor", label: "Legal Advisor" },
    { value: "project-coordinator", label: "Project Coordinator" }
  ],
  ngo: [
    { value: "program-manager", label: "Program Manager" },
    { value: "community-outreach-coordinator", label: "Community Outreach Coordinator" },
    { value: "grant-writer", label: "Grant Writer" },
    { value: "fundraising-specialist", label: "Fundraising Specialist" },
    { value: "volunteer-coordinator", label: "Volunteer Coordinator" },
    { value: "research-analyst", label: "Research Analyst" },
    { value: "communications-officer", label: "Communications Officer" },
    { value: "field-officer", label: "Field Officer" },
    { value: "development-officer", label: "Development Officer" }
  ],
  "real-estate": [
    { value: "real-estate-agent", label: "Real Estate Agent" },
    { value: "property-manager", label: "Property Manager" },
    { value: "real-estate-developer", label: "Real Estate Developer" },
    { value: "appraiser", label: "Appraiser" },
    { value: "mortgage-broker", label: "Mortgage Broker" },
    { value: "real-estate-analyst", label: "Real Estate Analyst" },
    { value: "property-inspector", label: "Property Inspector" },
    { value: "leasing-consultant", label: "Leasing Consultant" },
    { value: "real-estate-attorney", label: "Real Estate Attorney" },
    { value: "investment-advisor", label: "Investment Advisor" },
    { value: "construction-manager", label: "Construction Manager" }
  ],
  marketing: [
    { value: "marketing-manager", label: "Marketing Manager" },
    { value: "digital-marketing-specialist", label: "Digital Marketing Specialist" },
    { value: "content-creator", label: "Content Creator" },
    { value: "social-media-manager", label: "Social Media Manager" },
    { value: "seo-specialist", label: "SEO Specialist" },
    { value: "brand-manager", label: "Brand Manager" },
    { value: "market-research-analyst", label: "Market Research Analyst" },
    { value: "advertising-executive", label: "Advertising Executive" },
    { value: "public-relations-specialist", label: "Public Relations Specialist" },
    { value: "email-marketing-specialist", label: "Email Marketing Specialist" },
    { value: "growth-hacker", label: "Growth Hacker" }
  ],
  other: []
}

export default function CreatorOnboardingPage() {
  const [selectedIndustry, setSelectedIndustry] = useState("")
  const [selectedRole, setSelectedRole] = useState("")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    userType: "",
    organization: "",
    jobTitle: "",
    phone: "",
    description: "",
    goals: "",
    sources: [] as string[],
    customSource: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

  const availableRoles = selectedIndustry ? industryRoles[selectedIndustry] || [] : []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Create new user
      const newUser = {
        id: `creator-${Date.now()}`,
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        role: "creator" as const,
        isVerified: true
      }

      // Sign in the user
      signIn(newUser)
      
      // Redirect to creator dashboard
      router.push("/creator")
    } catch (error) {
      console.error("Registration failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSourceChange = (source: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      sources: checked 
        ? [...prev.sources, source]
        : prev.sources.filter(s => s !== source)
    }))
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <img src="/Logo.png" alt="Onetime Survey" className="h-16 w-auto mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Complete your profile</h1>
          <p className="text-slate-600">Tell us about yourself to create better surveys</p>
        </div>

        <Card className="w-full">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">First name</label>
                  <Input 
                    placeholder="Enter first name" 
                    className="h-11 border-slate-300 focus:border-[#C1654B] focus:ring-1 focus:ring-[#C1654B]"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Last name</label>
                  <Input 
                    placeholder="Enter last name" 
                    className="h-11 border-slate-300 focus:border-[#C1654B] focus:ring-1 focus:ring-[#C1654B]"
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
                  className="h-11 border-slate-300 focus:border-[#C1654B] focus:ring-1 focus:ring-[#C1654B]"
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
                  className="h-11 border-slate-300 focus:border-[#C1654B] focus:ring-1 focus:ring-[#C1654B]"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">User type</label>
              <Select>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual user</SelectItem>
                  <SelectItem value="small-business">Small business</SelectItem>
                  <SelectItem value="medium-business">Medium business</SelectItem>
                  <SelectItem value="large-company">Large company</SelectItem>
                  <SelectItem value="researcher">Researcher</SelectItem>
                  <SelectItem value="data-analyst">Data analyst</SelectItem>
                  <SelectItem value="lecturer">Lecturer</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="organization">Organization/NGO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">School/Company/Organization</label>
              <Input placeholder="Enter school, company or organization name" className="h-11 border-slate-300 focus:border-[#C1654B] focus:ring-1 focus:ring-[#C1654B]" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Job title</label>
              <Input placeholder="Enter job title" className="h-11 border-slate-300 focus:border-[#C1654B] focus:ring-1 focus:ring-[#C1654B]" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Industry</label>
              <Select value={selectedIndustry} onValueChange={(value) => { setSelectedIndustry(value); setSelectedRole(""); }}>
                <SelectTrigger className="h-11 border-slate-300 focus:border-[#C1654B] focus:ring-1 focus:ring-[#C1654B]">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                  <SelectItem value="ngo">NGO</SelectItem>
                  <SelectItem value="real-estate">Real estate</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Role in industry</label>
              <Select value={selectedRole} onValueChange={setSelectedRole} disabled={!selectedIndustry}>
                <SelectTrigger className={`h-11 ${!selectedIndustry ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' : 'border-slate-300 focus:border-[#C1654B] focus:ring-1 focus:ring-[#C1654B]'}`}>
                  <SelectValue placeholder={selectedIndustry ? "Select your role" : "Select industry first"} />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                  {selectedIndustry === "other" && (
                    <SelectItem value="other-role">Other</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {(selectedRole === "other-role" || selectedIndustry === "other") && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Custom role</label>
                <Input placeholder="Enter your specific role" className="h-11 border-slate-300 focus:border-[#C1654B] focus:ring-1 focus:ring-[#C1654B]" />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Phone number</label>
              <Input placeholder="Enter phone number" className="h-11 border-slate-300 focus:border-[#C1654B] focus:ring-1 focus:ring-[#C1654B]" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Company Description</label>
              <Textarea placeholder="Brief description of your company/organization" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Survey Goals</label>
              <Textarea placeholder="What do you hope to achieve with surveys?" />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium text-slate-700">How did you hear about Onetime Survey? (Select all that apply)</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="chatgpt" />
                  <label htmlFor="chatgpt" className="text-sm">ChatGPT</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="facebook" />
                  <label htmlFor="facebook" className="text-sm">Facebook</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="instagram" />
                  <label htmlFor="instagram" className="text-sm">Instagram</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="twitter" />
                  <label htmlFor="twitter" className="text-sm">Twitter/X</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="linkedin" />
                  <label htmlFor="linkedin" className="text-sm">LinkedIn</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="tiktok" />
                  <label htmlFor="tiktok" className="text-sm">TikTok</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="youtube" />
                  <label htmlFor="youtube" className="text-sm">YouTube</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="whatsapp" />
                  <label htmlFor="whatsapp" className="text-sm">WhatsApp</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="telegram" />
                  <label htmlFor="telegram" className="text-sm">Telegram</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="family" />
                  <label htmlFor="family" className="text-sm">Family</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="friends" />
                  <label htmlFor="friends" className="text-sm">Friends</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="colleagues" />
                  <label htmlFor="colleagues" className="text-sm">Colleagues</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="google-search" />
                  <label htmlFor="google-search" className="text-sm">Google Search</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="online-ad" />
                  <label htmlFor="online-ad" className="text-sm">Online Advertisement</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="website-blog" />
                  <label htmlFor="website-blog" className="text-sm">Website/Blog</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="email-newsletter" />
                  <label htmlFor="email-newsletter" className="text-sm">Email Newsletter</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="other-source" />
                  <label htmlFor="other-source" className="text-sm">Other</label>
                </div>
              </div>
              <div className="space-y-2">
                <Input placeholder="If other, please specify" className="h-11 border-slate-300 focus:border-[#C1654B] focus:ring-1 focus:ring-[#C1654B]" />
              </div>
            </div>

              <Button 
                type="submit"
                variant="creator"
                className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Complete setup"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}