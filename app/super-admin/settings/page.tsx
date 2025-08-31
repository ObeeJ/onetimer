"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Settings, Save, Shield, Bell, Database, Mail } from "lucide-react"

export default function SuperAdminSettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">System Settings</h1>
          <p className="text-slate-600">Configure platform-wide settings</p>
        </div>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="platform-name">Platform Name</Label>
              <Input id="platform-name" defaultValue="OneTime Survey" />
            </div>
            <div>
              <Label htmlFor="support-email">Support Email</Label>
              <Input id="support-email" defaultValue="support@onetimesurvey.com" />
            </div>
            <div>
              <Label htmlFor="max-surveys">Max Surveys per User</Label>
              <Input id="max-surveys" type="number" defaultValue="50" />
            </div>
            <div>
              <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Switch id="maintenance-mode" />
                <Label htmlFor="maintenance-mode">Enable maintenance mode</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Input id="session-timeout" type="number" defaultValue="30" />
            </div>
            <div>
              <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
              <Input id="max-login-attempts" type="number" defaultValue="5" />
            </div>
            <div>
              <Label htmlFor="require-2fa">Two-Factor Authentication</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Switch id="require-2fa" defaultChecked />
                <Label htmlFor="require-2fa">Require 2FA for admins</Label>
              </div>
            </div>
            <div>
              <Label htmlFor="password-policy">Strong Password Policy</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Switch id="password-policy" defaultChecked />
                <Label htmlFor="password-policy">Enforce strong passwords</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Switch id="email-notifications" defaultChecked />
                <Label htmlFor="email-notifications">Send email notifications</Label>
              </div>
            </div>
            <div>
              <Label htmlFor="sms-notifications">SMS Notifications</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Switch id="sms-notifications" />
                <Label htmlFor="sms-notifications">Send SMS notifications</Label>
              </div>
            </div>
            <div>
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Switch id="push-notifications" defaultChecked />
                <Label htmlFor="push-notifications">Send push notifications</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              System Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="backup-frequency">Backup Frequency</Label>
              <select className="w-full p-2 border rounded-md" defaultValue="daily">
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div>
              <Label htmlFor="log-retention">Log Retention (days)</Label>
              <Input id="log-retention" type="number" defaultValue="90" />
            </div>
            <div>
              <Label htmlFor="api-rate-limit">API Rate Limit (requests/minute)</Label>
              <Input id="api-rate-limit" type="number" defaultValue="100" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Templates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="welcome-email">Welcome Email Template</Label>
            <Textarea 
              id="welcome-email" 
              rows={4}
              defaultValue="Welcome to OneTime Survey! We're excited to have you join our community..."
            />
          </div>
          <div>
            <Label htmlFor="survey-notification">Survey Notification Template</Label>
            <Textarea 
              id="survey-notification" 
              rows={4}
              defaultValue="A new survey is available for you to complete. Earn rewards by participating..."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}