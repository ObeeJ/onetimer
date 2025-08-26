import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface PageHeaderProps {
  title: string
  description?: string
  backHref?: string
  backLabel?: string
  children?: React.ReactNode
}

export function PageHeader({ 
  title, 
  description, 
  backHref, 
  backLabel = "Back",
  children 
}: PageHeaderProps) {
  return (
    <div className="border-b border-slate-100 bg-white/95 backdrop-blur-md sticky top-0 z-20 mb-8">
      <div className="px-8 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-5">
            {backHref && (
              <Link href={backHref}>
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-full hover:bg-slate-100 transition-all duration-200">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
            )}
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">{title}</h1>
              {description && (
                <p className="text-slate-500 mt-2 text-base font-medium">{description}</p>
              )}
            </div>
          </div>
          {children && (
            <div className="flex items-center space-x-3">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}