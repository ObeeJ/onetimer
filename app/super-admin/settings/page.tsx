"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Settings,
  DollarSign,
  CreditCard,
  Users,
  FileText,
  Shield,
  Globe,
  Smartphone,
  Mail,
  Bell,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  Key,
  Server,
  Database
} from "lucide-react"

interface PlatformSettings {
  general: {
    platformName: string
    supportEmail: string
    maintenanceMode: boolean
    registrationEnabled: boolean
    maxUsersPerDay: number
    sessionTimeout: number
  }
  financial: {
    minimumWithdrawal: number
    maximumWithdrawal: number
    withdrawalFeePercentage: number
    referralBonus: number
    surveyCreatorFee: number
    platformCommission: number
    paymentGatewayFee: number
  }
  surveys: {
    minimumParticipants: number
    maximumParticipants: number
    approvalRequired: boolean
    autoApprovalThreshold: number
    maxQuestionsPerSurvey: number
    surveyExpiryDays: number
    moderationEnabled: boolean
  }
  paystack: {
    publicKey: string
    secretKey: string
    webhookSecret: string
    environment: 'test' | 'live'
    callbackUrl: string
    webhookUrl: string
    autoVerifyBanks: boolean
  }
  notifications: {
    emailNotifications: boolean
    smsNotifications: boolean
    pushNotifications: boolean
    adminAlerts: boolean
    userWelcomeEmail: boolean
    surveyReminders: boolean
    paymentNotifications: boolean
  }
  security: {
    passwordMinLength: number
    requireMFA: boolean
    sessionEncryption: boolean
    rateLimitEnabled: boolean
    maxLoginAttempts: number
    lockoutDurationMinutes: number
    ipWhitelistEnabled: boolean
    auditLogRetentionDays: number
  }
}

export default function SuperAdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>({
    general: {
      platformName: 'OneTime Survey',
      supportEmail: 'support@onetimesurvey.com',
      maintenanceMode: false,
      registrationEnabled: true,
      maxUsersPerDay: 1000,
      sessionTimeout: 480
    },
    financial: {
      minimumWithdrawal: 5000,
      maximumWithdrawal: 500000,
      withdrawalFeePercentage: 2.0,
      referralBonus: 500,
      surveyCreatorFee: 10.0,
      platformCommission: 15.0,
      paymentGatewayFee: 1.5
    },
    surveys: {
      minimumParticipants: 10,
      maximumParticipants: 10000,
      approvalRequired: true,
      autoApprovalThreshold: 50,
      maxQuestionsPerSurvey: 50,
      surveyExpiryDays: 30,
      moderationEnabled: true
    },
    paystack: {
      publicKey: 'pk_test_****',
      secretKey: 'sk_test_****',
      webhookSecret: 'whsec_****',
      environment: 'test',
      callbackUrl: 'https://api.onetimesurvey.com/payments/callback',
      webhookUrl: 'https://api.onetimesurvey.com/payments/webhook',
      autoVerifyBanks: true
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
      adminAlerts: true,
      userWelcomeEmail: true,
      surveyReminders: true,
      paymentNotifications: true
    },
    security: {
      passwordMinLength: 8,
      requireMFA: false,
      sessionEncryption: true,
      rateLimitEnabled: true,
      maxLoginAttempts: 5,
      lockoutDurationMinutes: 15,
      ipWhitelistEnabled: false,
      auditLogRetentionDays: 90
    }
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSecrets, setShowSecrets] = useState(false)
  const [selectedTab, setSelectedTab] = useState("general")
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    // Simulate loading settings
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleSettingChange = (category: keyof PlatformSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
    setHasChanges(true)
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    
    // Simulate API call to save settings
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setHasChanges(false)
    setSaving(false)
    
    // Show success notification
    alert('Settings saved successfully!')
  }

  const handleResetToDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      // Reset to default values
      setHasChanges(true)
    }
  }

  const testPaystackConnection = async () => {
    // Simulate Paystack API test
    alert('Testing Paystack connection...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    alert('Paystack connection test successful!')
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="space-y-6">
          <div className="h-8 bg-slate-200 rounded animate-pulse w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 bg-slate-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Platform Configuration</h1>
          <p className="text-slate-600">Manage global platform settings and integrations</p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <Badge variant="destructive" className="animate-pulse">
              Unsaved Changes
            </Badge>
          )}
          <Button variant="outline" onClick={handleResetToDefaults}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button 
            onClick={handleSaveSettings}
            disabled={!hasChanges || saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Warning for Maintenance Mode */}
      {settings.general.maintenanceMode && (
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Maintenance Mode Active:</strong> The platform is currently in maintenance mode. Users cannot access the application.
          </AlertDescription>
        </Alert>
      )}

      {/* Settings Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="surveys">Surveys</TabsTrigger>
          <TabsTrigger value="paystack">Paystack</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                General Platform Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Platform Name</label>
                  <Input
                    value={settings.general.platformName}
                    onChange={(e) => handleSettingChange('general', 'platformName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Support Email</label>
                  <Input
                    type="email"
                    value={settings.general.supportEmail}
                    onChange={(e) => handleSettingChange('general', 'supportEmail', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Max New Users Per Day</label>
                  <Input
                    type="number"
                    value={settings.general.maxUsersPerDay}
                    onChange={(e) => handleSettingChange('general', 'maxUsersPerDay', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Session Timeout (minutes)</label>
                  <Input
                    type="number"
                    value={settings.general.sessionTimeout}
                    onChange={(e) => handleSettingChange('general', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Maintenance Mode</p>
                    <p className="text-sm text-slate-600">Temporarily disable platform access for maintenance</p>
                  </div>
                  <Switch
                    checked={settings.general.maintenanceMode}
                    onCheckedChange={(checked) => handleSettingChange('general', 'maintenanceMode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">User Registration</p>
                    <p className="text-sm text-slate-600">Allow new users to register on the platform</p>
                  </div>
                  <Switch
                    checked={settings.general.registrationEnabled}
                    onCheckedChange={(checked) => handleSettingChange('general', 'registrationEnabled', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Settings */}
        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Minimum Withdrawal (₦)</label>
                  <Input
                    type="number"
                    value={settings.financial.minimumWithdrawal}
                    onChange={(e) => handleSettingChange('financial', 'minimumWithdrawal', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Maximum Withdrawal (₦)</label>
                  <Input
                    type="number"
                    value={settings.financial.maximumWithdrawal}
                    onChange={(e) => handleSettingChange('financial', 'maximumWithdrawal', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Withdrawal Fee (%)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={settings.financial.withdrawalFeePercentage}
                    onChange={(e) => handleSettingChange('financial', 'withdrawalFeePercentage', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Referral Bonus (₦)</label>
                  <Input
                    type="number"
                    value={settings.financial.referralBonus}
                    onChange={(e) => handleSettingChange('financial', 'referralBonus', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Survey Creator Fee (%)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={settings.financial.surveyCreatorFee}
                    onChange={(e) => handleSettingChange('financial', 'surveyCreatorFee', parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Platform Commission (%)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={settings.financial.platformCommission}
                    onChange={(e) => handleSettingChange('financial', 'platformCommission', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Payment Gateway Fee (%)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={settings.financial.paymentGatewayFee}
                    onChange={(e) => handleSettingChange('financial', 'paymentGatewayFee', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Survey Settings */}
        <TabsContent value="surveys" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Survey Management Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Minimum Participants</label>
                  <Input
                    type="number"
                    value={settings.surveys.minimumParticipants}
                    onChange={(e) => handleSettingChange('surveys', 'minimumParticipants', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Maximum Participants</label>
                  <Input
                    type="number"
                    value={settings.surveys.maximumParticipants}
                    onChange={(e) => handleSettingChange('surveys', 'maximumParticipants', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Auto-Approval Threshold (₦)</label>
                  <Input
                    type="number"
                    value={settings.surveys.autoApprovalThreshold}
                    onChange={(e) => handleSettingChange('surveys', 'autoApprovalThreshold', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Max Questions Per Survey</label>
                  <Input
                    type="number"
                    value={settings.surveys.maxQuestionsPerSurvey}
                    onChange={(e) => handleSettingChange('surveys', 'maxQuestionsPerSurvey', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Survey Expiry (days)</label>
                  <Input
                    type="number"
                    value={settings.surveys.surveyExpiryDays}
                    onChange={(e) => handleSettingChange('surveys', 'surveyExpiryDays', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Manual Approval Required</p>
                    <p className="text-sm text-slate-600">All surveys require admin approval before publication</p>
                  </div>
                  <Switch
                    checked={settings.surveys.approvalRequired}
                    onCheckedChange={(checked) => handleSettingChange('surveys', 'approvalRequired', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Content Moderation</p>
                    <p className="text-sm text-slate-600">Enable automatic content moderation for surveys</p>
                  </div>
                  <Switch
                    checked={settings.surveys.moderationEnabled}
                    onCheckedChange={(checked) => handleSettingChange('surveys', 'moderationEnabled', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paystack Settings */}
        <TabsContent value="paystack" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Paystack Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium">Environment</p>
                  <p className="text-sm text-slate-600">Current environment setting</p>
                </div>
                <select 
                  value={settings.paystack.environment}
                  onChange={(e) => handleSettingChange('paystack', 'environment', e.target.value)}
                  className="px-3 py-2 border rounded-lg"
                >
                  <option value="test">Test</option>
                  <option value="live">Live</option>
                </select>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium flex items-center gap-2">
                    Public Key
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSecrets(!showSecrets)}
                    >
                      {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </label>
                  <Input
                    type={showSecrets ? "text" : "password"}
                    value={settings.paystack.publicKey}
                    onChange={(e) => handleSettingChange('paystack', 'publicKey', e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Secret Key</label>
                  <Input
                    type={showSecrets ? "text" : "password"}
                    value={settings.paystack.secretKey}
                    onChange={(e) => handleSettingChange('paystack', 'secretKey', e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Webhook Secret</label>
                  <Input
                    type={showSecrets ? "text" : "password"}
                    value={settings.paystack.webhookSecret}
                    onChange={(e) => handleSettingChange('paystack', 'webhookSecret', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Callback URL</label>
                  <Input
                    value={settings.paystack.callbackUrl}
                    onChange={(e) => handleSettingChange('paystack', 'callbackUrl', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Webhook URL</label>
                  <Input
                    value={settings.paystack.webhookUrl}
                    onChange={(e) => handleSettingChange('paystack', 'webhookUrl', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-Verify Banks</p>
                  <p className="text-sm text-slate-600">Automatically verify bank account details</p>
                </div>
                <Switch
                  checked={settings.paystack.autoVerifyBanks}
                  onCheckedChange={(checked) => handleSettingChange('paystack', 'autoVerifyBanks', checked)}
                />
              </div>

              <div className="pt-4">
                <Button onClick={testPaystackConnection} variant="outline">
                  <Key className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </p>
                      <p className="text-sm text-slate-600">
                        {key === 'emailNotifications' && 'Send email notifications to users'}
                        {key === 'smsNotifications' && 'Send SMS notifications for important updates'}
                        {key === 'pushNotifications' && 'Send push notifications via mobile app'}
                        {key === 'adminAlerts' && 'Send alerts to administrators'}
                        {key === 'userWelcomeEmail' && 'Send welcome email to new users'}
                        {key === 'surveyReminders' && 'Send reminders for incomplete surveys'}
                        {key === 'paymentNotifications' && 'Send notifications for payment events'}
                      </p>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => handleSettingChange('notifications', key, checked)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Password Min Length</label>
                  <Input
                    type="number"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Max Login Attempts</label>
                  <Input
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Lockout Duration (minutes)</label>
                  <Input
                    type="number"
                    value={settings.security.lockoutDurationMinutes}
                    onChange={(e) => handleSettingChange('security', 'lockoutDurationMinutes', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Audit Log Retention (days)</label>
                <Input
                  type="number"
                  value={settings.security.auditLogRetentionDays}
                  onChange={(e) => handleSettingChange('security', 'auditLogRetentionDays', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-4">
                {Object.entries(settings.security)
                  .filter(([key]) => typeof settings.security[key as keyof typeof settings.security] === 'boolean')
                  .map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </p>
                      <p className="text-sm text-slate-600">
                        {key === 'requireMFA' && 'Require multi-factor authentication for all users'}
                        {key === 'sessionEncryption' && 'Encrypt user session data'}
                        {key === 'rateLimitEnabled' && 'Enable API rate limiting'}
                        {key === 'ipWhitelistEnabled' && 'Restrict access to whitelisted IP addresses'}
                      </p>
                    </div>
                    <Switch
                      checked={value as boolean}
                      onCheckedChange={(checked) => handleSettingChange('security', key, checked)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
