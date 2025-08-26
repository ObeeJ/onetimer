"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// categories removed - badge omitted
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Coins, Clock } from "lucide-react"
import type { Survey } from "@/types/survey"

export default function SurveyCard({ survey }: { survey: Survey }) {
  const reward = survey.reward ?? 0
  const eligible = survey.eligible ?? true

  return (
    <Card className="group h-full rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="line-clamp-2 text-lg font-semibold leading-tight text-slate-900">
            {survey.title}
          </CardTitle>
          <div className="text-sm text-slate-500 ml-3 flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span className="font-medium">{survey.estimatedTime}m</span>
            </div>
            <div className="flex items-center gap-1">
              <Coins className="h-4 w-4" />
              <span className="font-semibold text-amber-600">{reward} pts</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 pb-3">
        <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">{survey.description}</p>
      </CardContent>

      <CardFooter className="flex items-center gap-3 pt-4 flex-nowrap">
        <Button
          asChild
          variant="outline"
          className="h-11 flex-1 min-w-0 whitespace-nowrap rounded-xl border-slate-300 bg-white font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-400"
          size="lg"
        >
          <Link href={`/filler/surveys/${survey.id}`}>
            <span className="truncate">Details</span>
          </Link>
        </Button>
        <Button
          asChild
          className="h-11 flex-1 min-w-0 whitespace-nowrap rounded-xl bg-[#013F5C] font-semibold text-white shadow-sm transition-all hover:bg-[#0b577a] hover:shadow-md disabled:bg-slate-300 disabled:text-slate-500"
          size="lg"
          disabled={!eligible}
        >
          <Link href={eligible ? `/filler/surveys/${survey.id}/take` : "#"}>
            <span className="truncate">{eligible ? "Start Survey" : "Not Eligible"}</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

SurveyCard.defaultProps = {
  survey: {
    id: "0",
    title: "Untitled",
    description: "No description",
    estimatedTime: 5,
    reward: 10,
    eligible: true,
  },
}
