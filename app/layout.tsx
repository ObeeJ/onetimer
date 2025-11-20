import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/providers/auth-provider"
import { ReactQueryProvider } from "@/lib/react-query"
import { Toaster } from "@/components/ui/toast"

// Browser compatibility polyfills
if (typeof window !== 'undefined') {
  if (!document.adoptedStyleSheets) {
    document.adoptedStyleSheets = [];
  }
}

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "OneTime Survey Platform",
  description: "Comprehensive survey platform connecting creators with respondents",
  icons: {
    icon: ['/favicon.ico', '/favicon-16x16.png', '/favicon-32x32.png'],
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ReactQueryProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}