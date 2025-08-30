"use client"

import { useEffect, useMemo, useState, use } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Coins, Star } from 'lucide-react'
import { useRouter } from "next/navigation"
import { fetchJSON } from "@/hooks/use-api"
import SurveyProgress from "@/components/surveys/survey-progress"

type SingleQ = { id: string; type: "single"; text: string; options: string[] }
type MultiQ = { id: string; type: "multi"; text: string; options: string[] }
type TextQ = { id: string; type: "text"; text: string; placeholder?: string }
type RatingQ = { id: string; type: "rating"; text: string; scale?: number }
type MatrixQ = { id: string; type: "matrix"; text: string; rows: string[]; cols: string[] }
type Q = SingleQ | MultiQ | TextQ | RatingQ | MatrixQ

export default function TakeSurveyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [questions, setQuestions] = useState<Q[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [idx, setIdx] = useState(0)
  const router = useRouter()
  const [reward, setReward] = useState(20)

  useEffect(() => {
    fetchJSON<{ data: Q[] }>(`/api/surveys/${id}`).then((r) => {
      setQuestions(r.data)
      setReward(30 + Math.floor(Math.random() * 30))
    })
  }, [id])

  const q = questions[idx]
  const progress = useMemo(() => (questions.length ? ((idx) / questions.length) * 100 : 0), [idx, questions.length])

  const isValid = (q?: Q) => {
    if (!q) return false
    const a = answers[q.id]
    switch (q.type) {
      case "single":
        return a && a.length > 0
      case "multi":
        return a && a.split(',').length > 0
      case "text":
        return a && a.trim().length >= 2
      case "rating":
        return a && parseInt(a, 10) > 0
      case "matrix":
        try {
          const matrix = JSON.parse(a || '{}')
          return q.rows.every((r) => matrix[r])
        } catch {
          return false
        }
    }
  }

  const submit = async () => {
    await fetch(`/api/surveys/${id}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    })
    router.push("/filler/earnings")
  }

  const renderQuestion = (q: Q) => {
    if (q.type === "single") {
      return (
        <RadioGroup 
          value={String(answers[q.id] ?? "")} 
          onValueChange={(v: string) => setAnswers((a) => ({ ...a, [q.id]: v }))}
        >
          {q.options.map((opt) => (
            <div key={opt} className="flex items-center space-x-2">
              <RadioGroupItem id={`${q.id}-${opt}`} value={opt} />
              <Label htmlFor={`${q.id}-${opt}`}>{opt}</Label>
            </div>
          ))}
        </RadioGroup>
      )
    }
    if (q.type === "multi") {
      const arr = answers[q.id] ? answers[q.id].split(',') : []
      return (
        <div className="grid gap-2">
          {q.options.map((opt) => (
            <label key={opt} className="flex items-center gap-2">
              <Checkbox
                checked={arr.includes(opt)}
                onCheckedChange={(checked) => {
                  const next = new Set<string>(arr)
                  if (checked) next.add(opt)
                  else next.delete(opt)
                  setAnswers((a) => ({ ...a, [q.id]: Array.from(next).join(',') }))
                }}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      )
    }
    if (q.type === "text") {
      return (
        <Textarea
          placeholder={q.placeholder ?? "Type your answer"}
          value={String(answers[q.id] ?? "")}
          onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
        />
      )
    }
    if (q.type === "rating") {
      const scale = q.scale ?? 5
      const val = parseInt(answers[q.id] ?? '0', 10)
      return (
        <div className="flex items-center gap-2">
          {Array.from({ length: scale }).map((_, i) => {
            const n = i + 1
            return (
              <button
                key={n}
                onClick={() => setAnswers((a) => ({ ...a, [q.id]: String(n) }))}
                className="p-1"
                aria-label={`Rate ${n}`}
              >
                <Star className={`h-6 w-6 ${n <= val ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
              </button>
            )
          })}
        </div>
      )
    }
    if (q.type === "matrix") {
      const matrix = answers[q.id] ? JSON.parse(answers[q.id]) : {}
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="p-2 text-left"></th>
                {q.cols.map((c) => (
                  <th key={c} className="p-2 text-center">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {q.rows.map((r) => (
                <tr key={r} className="border-t">
                  <td className="p-2">{r}</td>
                  {q.cols.map((c) => (
                    <td key={c} className="p-2 text-center">
                      <input
                        type="radio"
                        name={`row-${q.id}-${r}`}
                        aria-label={`${r} - ${c}`}
                        checked={matrix[r] === c}
                        onChange={() => {
                          const newMatrix = { ...matrix, [r]: c }
                          setAnswers((a) => ({ ...a, [q.id]: JSON.stringify(newMatrix) }))
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
    return null
  }

  if (!q) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Card className="rounded-2xl border border-border/40 bg-background/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Loading survey&hellip;</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SurveyProgress value={progress} />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <Card className="rounded-2xl border border-border/40 bg-background/60 backdrop-blur-xl">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base sm:text-lg">
            Q{idx + 1} of {questions.length}
          </CardTitle>
          <div className="inline-flex items-center gap-1 text-sm">
            <Coins className="h-4 w-4 text-yellow-500" />
            Reward: {reward} pts
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <SurveyProgress value={progress} />
          <div className="space-y-4">
            <p className="font-semibold">{q.text}</p>
            {renderQuestion(q)}
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            className="rounded-2xl h-11"
            size="lg"
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
          >
            Back
          </Button>
          {idx < questions.length - 1 ? (
            <Button
              className="rounded-2xl h-11"
              size="lg"
              onClick={() => setIdx((i) => Math.min(questions.length - 1, i + 1))}
              disabled={!isValid(q)}
            >
              Next
            </Button>
          ) : (
            <Button
              className="rounded-2xl h-11"
              size="lg"
              onClick={submit}
              disabled={!questions.every((qq) => isValid(qq))}
            >
              Submit
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
