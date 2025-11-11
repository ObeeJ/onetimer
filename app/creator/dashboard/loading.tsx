import { DashboardSkeleton } from "@/components/ui/loading-states"

export default function Loading() {
  return (
    <div className="flex-1 min-w-0 overflow-auto">
      <div className="mx-auto max-w-none space-y-8 p-4 sm:p-6 lg:p-8">
        <DashboardSkeleton />
      </div>
    </div>
  )
}