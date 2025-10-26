'''import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function SurveyCardSkeleton() {
  return (
    <Card className="rounded-2xl shadow-sm animate-pulse">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="h-5 w-20 bg-slate-200 rounded-full"></div>
          <div className="h-6 w-16 bg-slate-200 rounded-md"></div>
        </div>
        <div className="h-6 w-3/4 bg-slate-200 rounded-md mt-2"></div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
            <div className="h-4 w-full bg-slate-200 rounded-md"></div>
            <div className="h-4 w-5/6 bg-slate-200 rounded-md"></div>
        </div>
        <div className="flex items-center gap-4">
            <div className="h-4 w-20 bg-slate-200 rounded-md"></div>
            <div className="h-4 w-20 bg-slate-200 rounded-md"></div>
        </div>
        <div className="h-10 w-full bg-slate-200 rounded-lg mt-2"></div>
      </CardContent>
    </Card>
  )
}
'''