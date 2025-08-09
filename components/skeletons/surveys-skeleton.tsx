"use client"

import { Skeleton } from "@/components/ui/skeleton"

export default function SurveysSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-slate-200 bg-white/70 p-4 backdrop-blur-xl">
          <Skeleton className="mb-3 h-5 w-3/4" />
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="mb-2 h-4 w-5/6" />
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Skeleton className="h-11 w-full rounded-2xl" />
            <Skeleton className="h-11 w-full rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  )
}

SurveysSkeleton.defaultProps = { count: 8 }
