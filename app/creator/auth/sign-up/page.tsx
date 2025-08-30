"use client"

import CreatorSignUpForm from "@/components/creator/creator-sign-up-form"

export default function CreatorSignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <img src="/Logo.png" alt="OneTime Survey Creator" className="h-16 w-auto mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Survey Creator Platform</h1>
          <p className="text-slate-600">Create surveys and collect valuable insights from our community</p>
        </div>
        <CreatorSignUpForm />
      </div>
    </main>
  )
}