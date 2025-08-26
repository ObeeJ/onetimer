"use client"

import React from "react"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { useBreadcrumbs } from "@/lib/breadcrumb-context"

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items: propItems, className = "" }: BreadcrumbProps) {
  const { items: contextItems } = useBreadcrumbs()
  const items = propItems || contextItems

  if (!items || items.length === 0) return null

  return (
    <nav className={`flex items-center space-x-2 text-sm text-slate-600 mb-4 overflow-x-auto ${className}`}>
      <Link 
        href="/creator/dashboard" 
        className="flex items-center hover:text-[#013f5c] transition-colors p-1 rounded hover:bg-slate-100 flex-shrink-0"
        title="Dashboard"
      >
        <Home className="h-4 w-4" />
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <React.Fragment key={index}>
            <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
            {item.href && !isLast ? (
              <Link 
                href={item.href} 
                className="hover:text-[#013f5c] transition-colors px-1 lg:px-2 py-1 rounded hover:bg-slate-100 flex items-center space-x-1 flex-shrink-0"
                title={item.label}
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                <span className="max-w-[120px] lg:max-w-[200px] truncate">{item.label}</span>
              </Link>
            ) : (
              <span className="text-slate-900 font-medium px-1 lg:px-2 py-1 flex items-center space-x-1 max-w-[120px] lg:max-w-[200px] flex-shrink-0">
                {item.icon && <item.icon className="h-4 w-4" />}
                <span className="truncate" title={item.label}>{item.label}</span>
              </span>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}

export { useBreadcrumbs } from "@/lib/breadcrumb-context"