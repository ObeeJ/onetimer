"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Shield,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  Key,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Server,
  Globe
} from "lucide-react"

export default function SuperAdminLoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<'credentials' | 'mfa' | 'verification'>('credentials')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  // Form states
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    totpCode: ''
  })
  
  const [mfaMethod, setMfaMethod] = useState<'totp' | 'sms' | 'hardware'>('totp')
  const [verificationCode, setVerificationCode] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [lockoutTime, setLockoutTime] = useState(0)

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate authentication with enhanced security
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Check for demo credentials
    if (credentials.email === 'superadmin@onetimesurvey.com' && credentials.password === 'SuperSecure2025!') {
      setStep('mfa')
    } else {
      setAttempts(prev => prev + 1)
      if (attempts >= 2) {
        setLockoutTime(300) // 5-minute lockout
      }
    }
    
    setLoading(false)
  }

  const handleMFASubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate MFA verification
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    if (verificationCode === '789012') {
      setStep('verification')
      
      // Final verification step
      setTimeout(() => {
        localStorage.setItem('superAdminSession', JSON.stringify({
          user: {
            id: 'super-admin-001',
            email: credentials.email,
            role: 'SUPER_ADMIN',
            permissions: ['ALL'],
            lastLogin: new Date().toISOString(),
            sessionId: `session_${Date.now()}`
          },
          expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() // 8 hours
        }))
        
        router.push('/super-admin/dashboard')
      }, 2000)
    } else {
      setAttempts(prev => prev + 1)
    }
    
    setLoading(false)
  }

  if (lockoutTime > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-slate-900 to-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-500 bg-red-950/50">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-100 mb-2">Account Locked</h1>
            <p className="text-red-300 mb-6">
              Too many failed login attempts. Please wait {Math.ceil(lockoutTime / 60)} minutes before trying again.
            </p>
            <Alert className="border-red-500 bg-red-950/30">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-300">
                Security incident logged. Administrator has been notified.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-12 w-12 text-blue-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">Super Admin</h1>
              <p className="text-blue-300">Platform Control Center</p>
            </div>
          </div>
          <Badge variant="destructive" className="bg-red-600">
            MAXIMUM SECURITY LEVEL
          </Badge>
        </div>

        {step === 'credentials' && (
          <Card className="border-blue-500 bg-slate-900/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Authentication Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Super Admin Email
                  </label>
                  <Input
                    type="email"
                    value={credentials.email}
                    onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                    className="bg-slate-800 border-slate-600 text-white"
                    placeholder="superadmin@onetimesurvey.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Master Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={credentials.password}
                      onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                      className="bg-slate-800 border-slate-600 text-white pr-10"
                      placeholder="SuperSecure2025!"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={loading || attempts >= 3}
                >
                  {loading ? 'Authenticating...' : 'Continue to MFA'}
                </Button>

                {attempts > 0 && (
                  <Alert className="border-red-500 bg-red-950/30">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-red-300">
                      Invalid credentials. Attempt {attempts}/3
                    </AlertDescription>
                  </Alert>
                )}
              </form>

              {/* Demo Credentials Notice */}
              <div className="mt-6 p-4 bg-blue-950/30 border border-blue-500 rounded-lg">
                <h4 className="text-blue-300 font-semibold mb-2">Demo Access</h4>
                <div className="text-sm text-blue-200 space-y-1">
                  <p><strong>Email:</strong> superadmin@onetimesurvey.com</p>
                  <p><strong>Password:</strong> SuperSecure2025!</p>
                  <p><strong>MFA Code:</strong> 789012</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'mfa' && (
          <Card className="border-orange-500 bg-slate-900/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Key className="h-5 w-5" />
                Multi-Factor Authentication
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* MFA Method Selection */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {[
                  { id: 'totp', label: 'Authenticator', icon: Smartphone },
                  { id: 'sms', label: 'SMS', icon: Mail },
                  { id: 'hardware', label: 'Hardware Key', icon: Key }
                ].map((method) => {
                  const Icon = method.icon
                  return (
                    <button
                      key={method.id}
                      onClick={() => setMfaMethod(method.id as any)}
                      className={`p-3 rounded-lg border transition-all ${
                        mfaMethod === method.id
                          ? 'border-orange-500 bg-orange-500/20 text-orange-300'
                          : 'border-slate-600 bg-slate-800 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      <Icon className="h-5 w-5 mx-auto mb-1" />
                      <p className="text-xs">{method.label}</p>
                    </button>
                  )
                })}
              </div>

              <form onSubmit={handleMFASubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    {mfaMethod === 'totp' ? 'Authenticator Code' : 
                     mfaMethod === 'sms' ? 'SMS Code' : 'Hardware Key Response'}
                  </label>
                  <Input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white text-center text-2xl tracking-widest"
                    placeholder="789012"
                    maxLength={6}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  disabled={loading || verificationCode.length !== 6}
                >
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <button 
                  onClick={() => setStep('credentials')}
                  className="text-sm text-slate-400 hover:text-white"
                >
                  ← Back to credentials
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'verification' && (
          <Card className="border-green-500 bg-slate-900/50 backdrop-blur">
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Access Granted</h2>
              <p className="text-green-300 mb-6">
                Initializing Super Admin Console...
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>Security protocols verified</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>Session encryption enabled</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>Audit logging activated</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Server className="h-4 w-4 text-blue-400 animate-pulse" />
                  <span>Loading platform controls...</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <Alert className="border-slate-600 bg-slate-800/30">
            <Globe className="h-4 w-4" />
            <AlertDescription className="text-slate-300">
              Super Admin access is logged and monitored. All actions are audited for security compliance.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  )
}
