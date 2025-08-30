"use client"

import CreatorSignInForm from "@/components/creator/creator-sign-in-form"

export default function CreatorSignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/Logo.png" alt="OneTime Survey Creator" className="h-16 w-auto mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Creator Platform</h1>
          <p className="text-slate-600">Sign in to manage your surveys and analytics</p>
        </div>
        <CreatorSignInForm />
      </div>
    </main>
  )
}