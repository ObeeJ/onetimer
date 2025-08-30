"use client"

import SignInForm from "@/components/auth/sign-in-form"
import { AuthLayout } from "@/components/auth/auth-layout"

export default function Page() {
  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Sign in to your account to continue earning"
    >
      <SignInForm />
    </AuthLayout>
  )
}
