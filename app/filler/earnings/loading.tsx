import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto space-y-6 p-4 md:p-6">
      <div className="rounded-2xl border border-border/40 bg-background/60 p-4 backdrop-blur-xl">
        <Skeleton className="mb-2 h-6 w-40" />
        <div className="grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
      <div className="rounded-2xl border border-border/40 bg-background/60 p-4 backdrop-blur-xl">
        <Skeleton className="mb-4 h-6 w-32" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
        </div>
      </div>
    </div>
  )
}
