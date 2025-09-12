import React from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  showBackButton?: boolean
  backHref?: string
  role?: string
}

export function AuthLayout({ 
  children, 
  title, 
  subtitle, 
  showBackButton = false, 
  backHref = "/filler",
  role = "filler"
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="w-full max-w-sm">
        {showBackButton && (
          <div className="mb-6">
            <Button asChild variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
              <Link href={backHref} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>
        )}
        
        <div className="text-center mb-8">
          <Link href="/filler">
            <img src="/Logo.png" alt="OneTime Survey" className="h-16 w-auto mx-auto mb-6" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{title}</h1>
          {subtitle && (
            <p className="text-slate-600 text-sm">{subtitle}</p>
          )}
        </div>
        
        {children}
      </div>
    </div>
  )
}