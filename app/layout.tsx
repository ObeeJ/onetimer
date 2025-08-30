import type React from "react"
import type { Metadata, Viewport } from "next"
import { Open_Sans } from "next/font/google"
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
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#013F5C",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${openSans.variable} antialiased`}>
      <head>
        <link rel="icon" href="/Logo.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/Logo.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/Logo.png" type="image/png" sizes="48x48" />
        <link rel="icon" href="/Logo.png" type="image/png" sizes="64x64" />
      </head>
      <body className="min-h-svh bg-white text-slate-900 font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
