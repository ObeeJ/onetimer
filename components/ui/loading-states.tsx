"use client"

import { Loader2 } from "lucide-react"

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-slate-200 rounded-xl"></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-64 bg-slate-200 rounded-xl"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-48 bg-slate-200 rounded-xl"></div>
    </div>
  )
}

export function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 bg-slate-200 rounded"></div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-slate-200 rounded"></div>
      ))}
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i}>
          <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-slate-200 rounded"></div>
        </div>
      ))}
    </div>
  )
}

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  }
  
  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-2 text-sm text-slate-600">Loading...</p>
      </div>
    </div>
  )
}