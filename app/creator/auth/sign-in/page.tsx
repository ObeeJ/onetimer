"use client"

import CreatorSignInForm from "@/components/creator/creator-sign-in-form"
import { AuthLayout } from "@/components/auth/auth-layout"

export default function CreatorSignInPage() {
  return (
    <AuthLayout
      title="Welcome back, Creator"
      subtitle="Sign in to your creator account to manage surveys and collect insights"
      role="creator"
    >
      <CreatorSignInForm />
    </AuthLayout>
  )
}