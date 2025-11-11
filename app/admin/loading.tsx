import { DashboardSkeleton } from "@/components/ui/loading-states"

export default function Loading() {
  return (
    <div className="space-y-6">
      <DashboardSkeleton />
    </div>
  )
}