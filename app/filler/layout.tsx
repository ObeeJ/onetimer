import type React from "react"
import type { Metadata } from "next"
import { FillerSidebar } from "@/components/filler-sidebar"

export const metadata: Metadata = {
  title: "Survey Filler | Dashboard",
  description: "Earn from surveys. Minimal, modern, fast PWA.",
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <FillerSidebar />
      <main className="ml-64 min-h-screen">
        {children}
      </main>
    </div>
  )
}

// Provide a viewport export for this layout as recommended by Next.js
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}
