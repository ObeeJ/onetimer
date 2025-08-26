"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  Smartphone,
  AlertCircle,
  CheckCircle2
} from "lucide-react"

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    mfaCode: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [mfaRequired, setMfaRequired] = useState(false)
  const [mfaMethod, setMfaMethod] = useState<'sms' | 'email' | 'app'>('sms')
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError("")
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      // Simulate admin authentication with enhanced security
      if (formData.email === "admin@oneTimesurvey.com" && formData.password === "AdminSecure2025!") {
        // Simulate MFA requirement
        if (!mfaRequired) {
          setMfaRequired(true)
          setSuccess(`MFA code sent to your ${mfaMethod === 'sms' ? 'phone' : mfaMethod === 'email' ? 'email' : 'authenticator app'}`)
          setLoading(false)
          return
        }

        // Validate MFA code
        if (formData.mfaCode === "123456") {
          setSuccess("Login successful! Redirecting to admin dashboard...")
          
          // Store admin session
          localStorage.setItem('adminAuth', JSON.stringify({
            email: formData.email,
            role: 'admin',
            loginTime: new Date().toISOString(),
            mfaVerified: true
          }))
          
          setTimeout(() => {
            router.push('/admin/dashboard')
          }, 1500)
        } else {
          setError("Invalid MFA code. Please try again.")
        }
      } else {
        setError("Invalid admin credentials. Access denied.")
      }
    } catch (err) {
      setError("Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const resendMFA = () => {
    setSuccess(`New MFA code sent to your ${mfaMethod === 'sms' ? 'phone' : mfaMethod === 'email' ? 'email' : 'authenticator app'}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-slate-400">Secure administrator access with MFA</p>
        </div>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-center">
              {mfaRequired ? "Multi-Factor Authentication" : "Administrator Login"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {!mfaRequired ? (
                <>
                  {/* Email Input */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300">Admin Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="admin@onetimesurvey.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-300">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your secure password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-10 pr-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* MFA Code Input */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <Smartphone className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                      <p className="text-slate-300 text-sm">
                        Enter the 6-digit verification code sent to your registered device
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="mfaCode" className="text-slate-300">Verification Code</Label>
                      <Input
                        id="mfaCode"
                        name="mfaCode"
                        type="text"
                        placeholder="123456"
                        value={formData.mfaCode}
                        onChange={handleInputChange}
                        className="text-center text-2xl tracking-widest bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                        maxLength={6}
                        required
                      />
                    </div>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={resendMFA}
                        className="text-blue-400 hover:text-blue-300 text-sm underline"
                      >
                        Resend code
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Error Message */}
              {error && (
                <Alert className="border-red-600 bg-red-900/20">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-400">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Success Message */}
              {success && (
                <Alert className="border-green-600 bg-green-900/20">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-400">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {mfaRequired ? "Verifying..." : "Authenticating..."}
                  </div>
                ) : (
                  mfaRequired ? "Verify & Login" : "Secure Login"
                )}
              </Button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-yellow-400" />
                <span className="text-yellow-400 text-sm font-medium">Security Notice</span>
              </div>
              <p className="text-slate-400 text-xs">
                This admin portal uses enhanced security measures including multi-factor authentication. 
                All access attempts are logged and monitored.
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
              <p className="text-blue-400 text-xs font-medium mb-1">Demo Credentials:</p>
              <p className="text-blue-300 text-xs">Email: admin@onetimesurvey.com</p>
              <p className="text-blue-300 text-xs">Password: AdminSecure2025!</p>
              <p className="text-blue-300 text-xs">MFA Code: 123456</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <Link href="/" className="text-slate-400 hover:text-slate-300 text-sm">
            ← Back to Main Site
          </Link>
        </div>
      </div>
    </div>
  )
}
