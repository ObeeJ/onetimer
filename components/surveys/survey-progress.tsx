"use client"

import { Progress } from "@/components/ui/progress"

export default function SurveyProgress({ value = 0 }: { value?: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span>Progress</span>
        <span>{Math.round(value)}%</span>
      </div>
      <Progress value={value} />
    </div>
  )
}
