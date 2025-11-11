import { FormSkeleton } from "@/components/ui/loading-states"

export default function Loading() {
  return (
    <div className="flex-1 min-w-0 overflow-auto">
      <div className="mx-auto max-w-none space-y-8 p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/4 mb-6"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-8"></div>
        </div>
        <div className="rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm">
          <FormSkeleton />
        </div>
      </div>
    </div>
  )
}