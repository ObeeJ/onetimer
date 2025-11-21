"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Shield, Sliders, Loader2, AlertCircle } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"
import { api } from "@/hooks/use-api"
import { useToast } from "@/hooks/use-toast"
import { SettingsSkeleton } from "@/components/ui/skeleton-loader"

// Validation logic
const validateField = (name: string, value: string, password = '') => {
  switch (name) {
    case 'first_name':
    case 'last_name':
      return value.length < 2 ? 'Must be at least 2 characters.' : '';
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Invalid email address.';
    case 'phone':
      return /^[0-9+\-\s()]+$/.test(value) ? '' : 'Invalid phone number.';
    case 'currentPassword':
      return value.length === 0 ? 'Current password is required.' : '';
    case 'newPassword':
      if (value.length < 8) return 'Must be at least 8 characters.';
      if (!/[A-Z]/.test(value)) return 'Must include uppercase letter.';
      if (!/[a-z]/.test(value)) return 'Must include lowercase letter.';
      if (!/[0-9]/.test(value)) return 'Must include a number.';
      if (!/[^A-Za-z0-9]/.test(value)) return 'Must include a special character.';
      return '';
    case 'confirmPassword':
      return value !== password ? 'Passwords do not match.' : '';
    default:
      return '';
  }
};

export default function FillerSettingsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [settingsLoading, setSettingsLoading] = useState(true)

  // Profile form state
  const [profileData, setProfileData] = useState({
    first_name: user?.name?.split(' ')[0] || '',
    last_name: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
  })
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({})

  // Security form state
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [securityErrors, setSecurityErrors] = useState<Record<string, string>>({})

  // Demographics form state
  const [demographicsData, setDemographicsData] = useState({
    age_range: '',
    gender: '',
    country: 'Nigeria',
    state: '',
  })

  // Preferences form state
  const [preferencesData, setPreferencesData] = useState({
    emailNotifications: true,
    surveyNotifications: true,
    marketingEmails: false,
    dataCollection: true,
  })

  useEffect(() => {
    // Simulate loading settings
    const fetchSettings = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        setSettingsLoading(false)
      } catch {
        setSettingsLoading(false)
      }
    }
    if (user) {
      fetchSettings()
    }
  }, [user])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData(prev => ({ ...prev, [name]: value }))
    setProfileErrors(prev => ({ ...prev, [name]: validateField(name, value) }))
  }

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSecurityData(prev => ({ ...prev, [name]: value }))
    setSecurityErrors(prev => ({
      ...prev,
      [name]: validateField(name, value, name === 'confirmPassword' ? securityData.newPassword : '')
    }))
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (Object.values(profileErrors).some(err => err)) return

    setIsLoading(true)
    try {
      await api.post('/user/profile', profileData)
      toast({ title: "Success", description: "Profile updated successfully!" })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (Object.values(securityErrors).some(err => err)) return

    setIsLoading(true)
    try {
      await api.post('/user/change-password', {
        old_password: securityData.currentPassword,
        new_password: securityData.newPassword,
      })
      toast({ title: "Success", description: "Password updated successfully!" })
      setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update password",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemographicsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await api.put('/onboarding/demographics', demographicsData)
      toast({ title: "Success", description: "Demographics updated successfully!" })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update demographics",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await api.post('/user/preferences', preferencesData)
      toast({ title: "Success", description: "Preferences updated successfully!" })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update preferences",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || settingsLoading) {
    return <SettingsSkeleton />
  }

  return (
    <div className="flex-1 min-w-0 overflow-auto">
      <div className="mx-auto max-w-none space-y-8 p-4 sm:p-6 lg:p-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="rounded-xl">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-slate-600" />
                  <CardTitle>Profile Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        name="first_name"
                        value={profileData.first_name}
                        onChange={handleProfileChange}
                        placeholder="John"
                      />
                      {profileErrors.first_name && (
                        <p className="text-sm text-red-600">{profileErrors.first_name}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        name="last_name"
                        value={profileData.last_name}
                        onChange={handleProfileChange}
                        placeholder="Doe"
                      />
                      {profileErrors.last_name && (
                        <p className="text-sm text-red-600">{profileErrors.last_name}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      placeholder="your.email@example.com"
                    />
                    {profileErrors.email && (
                      <p className="text-sm text-red-600">{profileErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      placeholder="+234 800 000 0000"
                    />
                    {profileErrors.phone && (
                      <p className="text-sm text-red-600">{profileErrors.phone}</p>
                    )}
                  </div>

                  <Button type="submit" disabled={isLoading} className="bg-[#013F5C] hover:bg-[#012d42]">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Profile
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="rounded-xl">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-slate-600" />
                  <CardTitle>Password & Security</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSecuritySubmit} className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Choose a strong password with uppercase, lowercase, and numbers
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={securityData.currentPassword}
                      onChange={handleSecurityChange}
                      placeholder="Enter your current password"
                    />
                    {securityErrors.currentPassword && (
                      <p className="text-sm text-red-600">{securityErrors.currentPassword}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={securityData.newPassword}
                      onChange={handleSecurityChange}
                      placeholder="Enter new password"
                    />
                    {securityErrors.newPassword && (
                      <p className="text-sm text-red-600">{securityErrors.newPassword}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={securityData.confirmPassword}
                      onChange={handleSecurityChange}
                      placeholder="Confirm new password"
                    />
                    {securityErrors.confirmPassword && (
                      <p className="text-sm text-red-600">{securityErrors.confirmPassword}</p>
                    )}
                  </div>

                  <Button type="submit" disabled={isLoading} className="bg-[#013F5C] hover:bg-[#012d42]">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Demographics Tab */}
          <TabsContent value="demographics" className="space-y-6">
            <Card className="rounded-xl">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-slate-600" />
                  <CardTitle>Demographics</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDemographicsSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age_range">Age Range</Label>
                      <select
                        id="age_range"
                        title="Select your age range"
                        value={demographicsData.age_range}
                        onChange={(e) => setDemographicsData(prev => ({ ...prev, age_range: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      >
                        <option value="">Select age range</option>
                        <option value="18-24">18-24</option>
                        <option value="25-34">25-34</option>
                        <option value="35-44">35-44</option>
                        <option value="45-54">45-54</option>
                        <option value="55+">55+</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <select
                        id="gender"
                        title="Select your gender"
                        value={demographicsData.gender}
                        onChange={(e) => setDemographicsData(prev => ({ ...prev, gender: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={demographicsData.country}
                        onChange={(e) => setDemographicsData(prev => ({ ...prev, country: e.target.value }))}
                        placeholder="Nigeria"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        value={demographicsData.state}
                        onChange={(e) => setDemographicsData(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="Lagos"
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isLoading} className="bg-[#013F5C] hover:bg-[#012d42]">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Demographics
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card className="rounded-xl">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-slate-600" />
                  <CardTitle>Notification Preferences</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePreferencesSubmit} className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-slate-600">Receive important updates via email</p>
                      </div>
                      <input
                        type="checkbox"
                        aria-label="Enable email notifications"
                        checked={preferencesData.emailNotifications}
                        onChange={(e) => setPreferencesData(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                        className="w-5 h-5"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                      <div>
                        <p className="font-medium">Survey Notifications</p>
                        <p className="text-sm text-slate-600">Get notified about new survey opportunities</p>
                      </div>
                      <input
                        type="checkbox"
                        aria-label="Enable survey notifications"
                        checked={preferencesData.surveyNotifications}
                        onChange={(e) => setPreferencesData(prev => ({ ...prev, surveyNotifications: e.target.checked }))}
                        className="w-5 h-5"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                      <div>
                        <p className="font-medium">Marketing Emails</p>
                        <p className="text-sm text-slate-600">Receive promotional content and offers</p>
                      </div>
                      <input
                        type="checkbox"
                        aria-label="Enable marketing emails"
                        checked={preferencesData.marketingEmails}
                        onChange={(e) => setPreferencesData(prev => ({ ...prev, marketingEmails: e.target.checked }))}
                        className="w-5 h-5"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                      <div>
                        <p className="font-medium">Data Collection</p>
                        <p className="text-sm text-slate-600">Allow us to collect data for research purposes</p>
                      </div>
                      <input
                        type="checkbox"
                        aria-label="Enable data collection"
                        checked={preferencesData.dataCollection}
                        onChange={(e) => setPreferencesData(prev => ({ ...prev, dataCollection: e.target.checked }))}
                        className="w-5 h-5"
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isLoading} className="bg-[#013F5C] hover:bg-[#012d42]">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Preferences
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
