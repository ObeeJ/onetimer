"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Building2, CreditCard, Bell, Shield, CheckCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { SettingsSkeleton } from "@/components/ui/skeleton-loader"
import type { Creator } from "@/types/user"

export default function CreatorSettingsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const creator = user as Creator | undefined
  const [isLoading, setIsLoading] = useState(false)
  const [settingsLoading, setSettingsLoading] = useState(true)

  useEffect(() => {
    // Simulate settings data fetching
    const fetchSettings = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800))
        setSettingsLoading(false)
      } catch (error) {
        setSettingsLoading(false)
      }
    }
    if (user) {
      fetchSettings()
    }
  }, [user])
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    organizationName: "",
    organizationType: "",
    website: "",
    phone: "",
    description: ""
  })

  const [paymentMethods] = useState([
    { id: "1", type: "card", last4: "4242", brand: "visa", isDefault: true }
  ])

  const [notifications, setNotifications] = useState({
    surveyApproved: true,
    newResponses: true,
    lowCredits: true,
    weeklyReport: false
  })

  const [surveyDefaults, setSurveyDefaults] = useState({
    defaultReward: 500,
    targetAudience: "general",
    autoApprove: false
  })

  const handleProfileUpdate = async () => {
    setIsLoading(true)
    // TODO: Update profile via API
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  const addPaymentMethod = () => {
    // TODO: Integrate with Paystack
    console.log("Adding payment method via Paystack")
  }

  if (authLoading || settingsLoading) {
    return <SettingsSkeleton />
  }

  return (
    <div className="flex-1 min-w-0 overflow-auto">
      <div className="mx-auto max-w-none space-y-8 p-4 sm:p-6 lg:p-8">
        <Breadcrumb items={[{ label: "Settings" }]} />
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600">Manage your account, payment methods, and preferences.</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="defaults">Defaults</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="rounded-xl">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-slate-600" />
                  <CardTitle>Profile Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organizationName">Organization Name</Label>
                    <Input
                      id="organizationName"
                      value={profileData.organizationName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, organizationName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organizationType">Organization Type</Label>
                    <Select value={profileData.organizationType} onValueChange={(value) => setProfileData(prev => ({ ...prev, organizationType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="business">Business/Company</SelectItem>
                        <SelectItem value="research">Research Institution</SelectItem>
                        <SelectItem value="education">Educational Institution</SelectItem>
                        <SelectItem value="individual">Individual Researcher</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://yourwebsite.com"
                      value={profileData.website}
                      onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of your organization or research goals"
                    value={profileData.description}
                    onChange={(e) => setProfileData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <Button onClick={handleProfileUpdate} disabled={isLoading} className="bg-[#C1654B] hover:bg-[#b25a43]">
                  {isLoading ? "Updating..." : "Update Profile"}
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-xl">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-slate-600" />
                  <CardTitle>Account Status</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Verification Status</p>
                    <p className="text-sm text-slate-600">Your account verification level</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <Badge className="bg-green-100 text-green-700">Verified</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment" className="space-y-6">
            <Card className="rounded-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-slate-600" />
                    <CardTitle>Payment Methods</CardTitle>
                  </div>
                  <Button onClick={addPaymentMethod} variant="outline">
                    Add Payment Method
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-6 bg-slate-200 rounded flex items-center justify-center">
                        <span className="text-xs font-bold uppercase">{method.brand}</span>
                      </div>
                      <div>
                        <p className="font-medium">•••• •••• •••• {method.last4}</p>
                        <p className="text-sm text-slate-600">
                          {method.isDefault && <Badge variant="secondary" className="mr-2">Default</Badge>}
                          Expires 12/25
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Remove</Button>
                  </div>
                ))}

                <Alert>
                  <CreditCard className="h-4 w-4" />
                  <AlertDescription>
                    Payment methods are securely processed through Paystack. Your card information is never stored on our servers.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>Credit Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{creator?.credits || 0} Credits</p>
                    <p className="text-sm text-slate-600">Available for survey launches</p>
                  </div>
                  <Button className="bg-[#C1654B] hover:bg-[#b25a43]">
                    Purchase Credits
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="defaults" className="space-y-6">
            <Card className="rounded-xl">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-slate-600" />
                  <CardTitle>Survey Defaults</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultReward">Default Reward Amount (₦)</Label>
                    <Input
                      id="defaultReward"
                      type="number"
                      min="100"
                      max="5000"
                      value={surveyDefaults.defaultReward}
                      onChange={(e) => setSurveyDefaults(prev => ({ ...prev, defaultReward: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetAudience">Default Target Audience</Label>
                    <Select value={surveyDefaults.targetAudience} onValueChange={(value) => setSurveyDefaults(prev => ({ ...prev, targetAudience: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Population</SelectItem>
                        <SelectItem value="18-24">Ages 18-24</SelectItem>
                        <SelectItem value="25-34">Ages 25-34</SelectItem>
                        <SelectItem value="35-44">Ages 35-44</SelectItem>
                        <SelectItem value="45+">Ages 45+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoApprove">Auto-approve qualified responses</Label>
                    <p className="text-sm text-slate-600">Automatically approve responses that meet quality criteria</p>
                  </div>
                  <Switch
                    id="autoApprove"
                    checked={surveyDefaults.autoApprove}
                    onCheckedChange={(checked) => setSurveyDefaults(prev => ({ ...prev, autoApprove: checked }))}
                  />
                </div>

                <Button className="bg-[#C1654B] hover:bg-[#b25a43]">
                  Save Defaults
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="rounded-xl">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-slate-600" />
                  <CardTitle>Notification Preferences</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="surveyApproved">Survey Approved</Label>
                      <p className="text-sm text-slate-600">Get notified when your surveys are approved</p>
                    </div>
                    <Switch
                      id="surveyApproved"
                      checked={notifications.surveyApproved}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, surveyApproved: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="newResponses">New Responses</Label>
                      <p className="text-sm text-slate-600">Get notified about new survey responses</p>
                    </div>
                    <Switch
                      id="newResponses"
                      checked={notifications.newResponses}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, newResponses: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="lowCredits">Low Credits Warning</Label>
                      <p className="text-sm text-slate-600">Get notified when your credit balance is low</p>
                    </div>
                    <Switch
                      id="lowCredits"
                      checked={notifications.lowCredits}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, lowCredits: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="weeklyReport">Weekly Report</Label>
                      <p className="text-sm text-slate-600">Receive weekly analytics summary</p>
                    </div>
                    <Switch
                      id="weeklyReport"
                      checked={notifications.weeklyReport}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weeklyReport: checked }))}
                    />
                  </div>
                </div>

                <Button className="bg-[#C1654B] hover:bg-[#b25a43]">
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}