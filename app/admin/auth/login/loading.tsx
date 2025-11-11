import { FormSkeleton } from "@/components/ui/loading-states"

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8">
        <FormSkeleton />
      </div>
    </div>
  )
}
