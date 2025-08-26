import type React from "react"
import { Logo } from "@/components/ui/logo"

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="flex min-h-screen flex-col">
        <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-4">
            <Logo 
              size="md" 
              showText={true} 
              href="/"
              textClassName="text-[#013F5C]"
              priority={true}
            />
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">{children}</div>
        </main>

        <footer className="border-t border-slate-200/60 bg-white/50 py-4">
          <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-600">
            <p>&copy; 2024 OneTime Survey. Complete your onboarding.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
