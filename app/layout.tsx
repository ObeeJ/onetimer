import type React from "react"
import type { Metadata } from "next"
import { Open_Sans } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-open-sans",
})

export const metadata: Metadata = {
  title: "OneTime Survey",
  description: "Earn more from one-time surveys. Fast, modern PWA.",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={openSans.variable}>
      <body className="min-h-svh bg-white text-slate-900 antialiased">
        {/* Force light mode app-wide (brand rule) */}
        <ThemeProvider attribute="class" forcedTheme="light" disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
