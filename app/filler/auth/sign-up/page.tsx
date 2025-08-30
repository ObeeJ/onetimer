"use client"

import SignUpForm from "@/components/auth/sign-up-form"

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="OneTime Survey" className="h-16 w-auto mx-auto mb-4" />
        </div>
        <SignUpForm />
      </div>
    </main>
  )
}
