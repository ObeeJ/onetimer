import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex-1 min-w-0 overflow-auto">
      <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-8 w-48" />
        </div>

        {/* Main Card Skeleton */}
        <Card className="rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-xl shadow-sm">
          <CardHeader className="pb-6">
            <div className="space-y-3">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Description Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5 rounded" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Eligibility Skeleton */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-3 w-48 mt-2" />
            </div>

            {/* Buttons Skeleton */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Skeleton className="h-12 flex-1 rounded-xl" />
              <Skeleton className="h-12 flex-1 rounded-xl" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
