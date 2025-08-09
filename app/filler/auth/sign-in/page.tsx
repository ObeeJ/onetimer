"use client"

import SignInForm from "@/components/auth/sign-in-form"

export default function Page() {
  return (
    <main className="mx-auto flex min-h-[calc(100svh-3.5rem)] max-w-6xl items-center justify-center p-4">
      <SignInForm />
    </main>
  )
}
