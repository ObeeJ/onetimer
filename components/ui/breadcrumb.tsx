"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const pathname = usePathname()
  
  // Determine home URL based on current path
  const getHomeUrl = () => {
    if (pathname?.startsWith('/creator')) return '/creator/dashboard'
    if (pathname?.startsWith('/admin')) return '/admin'
    if (pathname?.startsWith('/super-admin')) return '/super-admin'
    return '/filler'
  }

  return (
    <nav className={cn("flex items-center space-x-1 text-sm text-slate-600", className)}>
      <Link href={getHomeUrl()} className="flex items-center hover:text-slate-900 transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4 text-slate-400" />
          {item.href ? (
            <Link href={item.href} className="hover:text-slate-900 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-900 font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}