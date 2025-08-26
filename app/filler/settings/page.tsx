"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Bell, Shield, User, Wallet, Globe, Moon } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600">Manage your account preferences and settings</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <User className="h-5 w-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Profile Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" defaultValue="Survey" />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" defaultValue="Taker" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue="user@example.com" />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" defaultValue="+234 801 234 5678" />
            </div>
            
            <Button>Update Profile</Button>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="h-5 w-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">New Survey Alerts</p>
                <p className="text-sm text-slate-600">Get notified when new surveys match your profile</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Payment Notifications</p>
                <p className="text-sm text-slate-600">Receive alerts when payments are processed</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Weekly Summary</p>
                <p className="text-sm text-slate-600">Get weekly reports of your survey activity</p>
              </div>
              <Switch />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Marketing Emails</p>
                <p className="text-sm text-slate-600">Receive promotional offers and updates</p>
              </div>
              <Switch />
            </div>
          </div>
        </Card>

        {/* Payment Settings */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Wallet className="h-5 w-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Payment Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="bankName">Bank Name</Label>
              <Input id="bankName" placeholder="Select your bank" />
            </div>
            
            <div>
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input id="accountNumber" placeholder="Enter account number" />
            </div>
            
            <div>
              <Label htmlFor="accountName">Account Name</Label>
              <Input id="accountName" placeholder="Account holder name" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-blue-900">Auto-withdrawal</p>
                <p className="text-sm text-blue-700">Automatically withdraw earnings when they reach ₦5,000</p>
              </div>
              <Switch />
            </div>
            
            <Button>Update Payment Info</Button>
          </div>
        </Card>

        {/* Privacy & Security */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-5 w-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Privacy & Security</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                <p className="text-sm text-slate-600">Add an extra layer of security to your account</p>
              </div>
              <Button variant="outline" size="sm">Enable</Button>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Data Sharing</p>
                <p className="text-sm text-slate-600">Allow anonymous data sharing for research</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Profile Visibility</p>
                <p className="text-sm text-slate-600">Make your profile visible to survey creators</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <Button variant="destructive" className="mt-4">Change Password</Button>
          </div>
        </Card>

        {/* App Preferences */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Globe className="h-5 w-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">App Preferences</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Dark Mode</p>
                <p className="text-sm text-slate-600">Switch to dark theme</p>
              </div>
              <Switch />
            </div>
            
            <Separator />
            
            <div>
              <Label htmlFor="language">Language</Label>
              <Input id="language" defaultValue="English" />
            </div>
            
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" defaultValue="Africa/Lagos" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}