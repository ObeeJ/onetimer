"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestForgotPage() {
  const [email, setEmail] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Reset email sent to:", email)
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Test Forgot Password</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowModal(true)}>
            Forgot your password?
          </Button>
          
          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Reset Password</CardTitle>
                </CardHeader>
                <CardContent>
                  {!sent ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Send Reset Link</Button>
                      </div>
                    </form>
                  ) : (
                    <div className="text-center space-y-4">
                      <p>Reset link sent to {email}</p>
                      <Button onClick={() => setShowModal(false)}>Close</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
