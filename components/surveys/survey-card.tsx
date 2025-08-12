"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Coins, Clock } from "lucide-react"
import type { Survey } from "@/types/survey"

export default function SurveyCard({ survey }: { survey: Survey }) {
  const reward = survey.reward ?? 0
  const eligible = survey.eligible ?? true

  return (
    <Card className="group h-full rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1">
      <CardHeader className="pb-4">
        <CardTitle className="line-clamp-2 text-lg font-semibold leading-tight text-slate-900">
          {survey.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 pb-4">
        <p className="line-clamp-3 text-sm font-medium leading-relaxed text-slate-600">{survey.description}</p>

        <div className="flex items-center justify-between">
          <Badge
            variant="secondary"
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700 hover:bg-slate-200"
          >
            {survey.category}
          </Badge>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1 font-semibold text-amber-600">
              <Coins className="h-4 w-4" />
              {reward} pts
            </div>
            <div className="flex items-center gap-1 font-medium text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              {survey.estimatedTime}m
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center gap-3 pt-4">
        <Button
          asChild
          variant="outline"
          className="h-11 flex-1 rounded-xl border-slate-300 bg-white font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-400"
          size="lg"
        >
          <Link href={`/filler/surveys/${survey.id}`}>Details</Link>
        </Button>
        <Button
          asChild
          className="h-11 flex-1 rounded-xl bg-[#013F5C] font-semibold text-white shadow-sm transition-all hover:bg-[#0b577a] hover:shadow-md disabled:bg-slate-300 disabled:text-slate-500"
          size="lg"
          disabled={!eligible}
        >
          <Link href={eligible ? `/filler/surveys/${survey.id}/take` : "#"}>
            {eligible ? "Start Survey" : "Not Eligible"}
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
    category: "general",
    estimatedTime: 5,
    reward: 10,
    eligible: true,
  },
}
