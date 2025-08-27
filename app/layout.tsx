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
  description: "Nigeria's No.1 Survey Platform - Earn money taking surveys",
  generator: "v0.dev",
  themeColor: "#013F5C",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${openSans.variable} antialiased`}>
      <body className="min-h-svh bg-background text-foreground font-sans">
        <ThemeProvider attribute="class" forcedTheme="light" disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
