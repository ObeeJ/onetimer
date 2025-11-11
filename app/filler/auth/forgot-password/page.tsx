"use client"

import Image from "next/image"
import ForgotPasswordForm from "@/components/auth/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image src="/Logo.png" alt="OneTime Survey" width={64} height={64} className="h-16 w-auto mx-auto mb-4" />
        </div>
        <ForgotPasswordForm />
      </div>
    </main>
  )
}