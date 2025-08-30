"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { 
  Settings, 
  Shield, 
  CreditCard, 
  Bell,
  Save
} from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Settings</h1>
          <p className="text-slate-600">Configure platform settings and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Platform Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform-name">Platform Name</Label>
              <Input id="platform-name" defaultValue="OneTime Survey" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-email">Support Email</Label>
              <Input id="support-email" defaultValue="support@onetimesurvey.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-surveys">Max Surveys per Creator</Label>
              <Input id="max-surveys" type="number" defaultValue="50" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
              <Switch id="maintenance-mode" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-600" />
              Payment Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="min-payout">Minimum Payout (₦)</Label>
              <Input id="min-payout" type="number" defaultValue="5000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payout-fee">Payout Fee (%)</Label>
              <Input id="payout-fee" type="number" defaultValue="2.5" step="0.1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="survey-fee">Survey Creation Fee (₦)</Label>
              <Input id="survey-fee" type="number" defaultValue="1000" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-approve">Auto-approve Payouts</Label>
              <Switch id="auto-approve" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Input id="session-timeout" type="number" defaultValue="60" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
              <Input id="max-login-attempts" type="number" defaultValue="5" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="require-mfa">Require MFA for Admins</Label>
              <Switch id="require-mfa" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="kyc-required">KYC Required for Fillers</Label>
              <Switch id="kyc-required" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-purple-600" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <Switch id="email-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="survey-alerts">New Survey Alerts</Label>
              <Switch id="survey-alerts" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="payout-alerts">Payout Request Alerts</Label>
              <Switch id="payout-alerts" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="kyc-alerts">KYC Submission Alerts</Label>
              <Switch id="kyc-alerts" defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button className="bg-red-600 hover:bg-red-700">
          <Save className="h-4 w-4 mr-2" />
          Save All Settings
        </Button>
      </div>
    </div>
  )
}