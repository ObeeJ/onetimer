"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Coins } from "lucide-react"
import type { Survey } from "@/types/survey"

export default function SurveyCard({ survey }: { survey: Survey }) {
  const reward = survey.reward ?? 0
  const eligible = survey.eligible ?? true

  return (
    <Card className="group rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-xl transition-all duration-200 hover:shadow-md">
      <CardHeader>
        <CardTitle className="line-clamp-2">{survey.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="line-clamp-3 text-sm text-slate-600">{survey.description}</p>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="capitalize">
            {survey.category}
          </Badge>
          <div className="ml-auto inline-flex items-center gap-1 text-sm">
            <Coins className="h-4 w-4 text-yellow-500" />
            {reward} pts
          </div>
        </div>
        <div className="text-xs text-slate-500">{survey.estimatedTime} min</div>
      </CardContent>
      <CardFooter className="flex items-center gap-2">
        <Button asChild variant="outline" className="h-11 w-full rounded-2xl bg-transparent" size="lg">
          <Link href={`/filler/surveys/${survey.id}`}>Details</Link>
        </Button>
        <Button
          asChild
          className="h-11 w-full rounded-2xl bg-[#013F5C] text-white hover:bg-[#0b577a]"
          size="lg"
          disabled={!eligible}
        >
          <Link href={`/filler/surveys/${survey.id}/take`}>{eligible ? "Start" : "Not Eligible"}</Link>
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
