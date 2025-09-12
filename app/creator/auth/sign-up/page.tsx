"use client"

import { CreatorSignUpForm } from "@/components/creator/creator-sign-up-form"
import { AuthLayout } from "@/components/auth/auth-layout"

export default function CreatorSignUpPage() {
  return (
    <AuthLayout
      title="Create your Creator account"
      subtitle="Join thousands of businesses collecting valuable insights from our community"
      role="creator"
    >
      <CreatorSignUpForm />
    </AuthLayout>
  )
}