"use client"

import { FileQuestion, Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { usePathname } from "next/navigation"

export default function NotFound() {
  const { isAuthenticated, user } = useAuth()
  const pathname = usePathname()

  const getHomeUrl = () => {
    if (pathname && pathname.startsWith('/creator') || user?.role === 'creator') return '/creator/dashboard'
    if (user?.role === 'admin') return '/admin'
    if (user?.role === 'super_admin') return '/super-admin'
    if (isAuthenticated) return '/filler'
    return '/'
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <FileQuestion className="h-8 w-8 text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Page not found</h1>
        <p className="text-slate-600 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-[#013F5C] hover:bg-[#0b577a]">
            <Link href={getHomeUrl()}>
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}