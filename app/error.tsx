"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col">
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
        <div className="text-center space-y-6 max-w-md">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-red-600">Oops!</h1>
            <h2 className="text-xl font-semibold text-slate-700">Something went wrong</h2>
            <p className="text-slate-600">
              We encountered an unexpected error. Don't worry, our team has been notified and we're working to fix it.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={reset}
              className="bg-[#013F5C] hover:bg-[#0b577a] text-white"
            >
              Try Again
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
