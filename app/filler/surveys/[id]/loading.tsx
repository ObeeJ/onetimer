import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="rounded-2xl border border-border/40 bg-background/60 p-4 backdrop-blur-xl">
        <Skeleton className="mb-4 h-6 w-1/2" />
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="mb-2 h-4 w-5/6" />
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Skeleton className="h-11 rounded-2xl" />
          <Skeleton className="h-11 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
