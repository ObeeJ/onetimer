import type React from "react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  )
}
