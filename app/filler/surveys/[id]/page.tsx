"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { fetchJSON } from "@/hooks/use-api"
import { Clock, Coins, List, FileText, CheckSquare, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useRouter, useParams } from "next/navigation"
import Toast, { useToast } from "@/components/ui/toast"

export default function Page() {
  const [survey, setSurvey] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // use client-side params hook to get dynamic segment safely
  const params = useParams()
  const id = params?.id

  // hooks must be called unconditionally (avoid early returns before hooks)
  const router = useRouter()
  const toast = useToast()
  // state for interactive preview options (client-only visual demo)
  const [selectedPreview, setSelectedPreview] = useState<Record<string, Set<string>>>(() => ({}))

  useEffect(() => {
    if (!id) return
    let mounted = true
    setLoading(true)
    fetchJSON(`/api/surveys/${id}`)
      .then((d) => {
        if (!mounted) return
        if (!d?.survey) {
          setError("Survey not found")
          setSurvey(null)
        } else {
          setSurvey(d.survey)
        }
      })
      .catch((e) => {
        if (!mounted) return
        setError(e?.message ?? "Failed to load survey")
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [id])

  if (loading) return <div className="container mx-auto p-4 md:p-6">Loading...</div>
  if (error) return <div className="container mx-auto p-4 md:p-6">{error}</div>
  if (!survey) return <div className="container mx-auto p-4 md:p-6">Survey not found</div>

  const s = survey

  const togglePreviewOption = (qKey: string, option: string) => {
    setSelectedPreview((prev) => {
      const clone = { ...prev }
      const set = new Set(clone[qKey] ? Array.from(clone[qKey]) : [])
      if (set.has(option)) set.delete(option)
      else set.add(option)
      clone[qKey] = set
      return clone
    })
  }

  const handleStart = () => router.push(`/filler/surveys/${s.id}/take`)
  const handleBack = () => router.push(`/filler/surveys`)
  const handleCopyLink = async () => {
    const url = `${typeof window !== "undefined" ? window.location.href : ""}`
    try {
      await navigator.clipboard.writeText(url)
      toast.show({ title: "Link copied", description: "Survey link copied to clipboard" })
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("copy failed", e)
      toast.show({ title: "Copy failed", description: "Could not copy link" })
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border border-border/30 bg-background/60">
            <CardHeader className="pt-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-0">
                <div className="flex-1">
                  <CardTitle className="text-2xl md:text-3xl font-extrabold leading-tight">{s.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{s.description}</p>
                  {/* Aim */}
                  <div className="mt-3">
                    <h5 className="text-xs font-semibold text-slate-700">Aim of this survey</h5>
                    <p className="text-sm text-slate-600 mt-1">{s.aim ?? s.purpose ?? "Help improve our products and services by sharing your feedback."}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <Badge className="flex items-center gap-2 px-4 py-2 text-sm">
                      <Coins className="h-4 w-4 text-amber-600" />
                      <span className="font-medium">{s.reward ?? 0} pts</span>
                    </Badge>
                    <Badge className="flex items-center gap-2 px-4 py-2 text-sm mt-2">
                      <Clock className="h-4 w-4" /> <span className="font-medium">{s.estimatedTime ?? 0}m</span>
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Expectations */}
              <div className="rounded-md border border-slate-100 bg-white/60 p-4">
                <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <FileText className="h-4 w-4" /> What to expect
                </h4>
                <p className="text-sm text-slate-600 mt-2">
                  This survey has {Array.isArray((survey as any).data) ? (survey as any).data.length : "a few"} questions and should
                  take about <strong>{s.estimatedTime ?? 0} minutes</strong> to complete. Be honest and take your time — you'll earn
                  <strong> {s.reward ?? 0} points</strong> when your submission is accepted.
                </p>

                <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="text-xs text-slate-500">Difficulty</div>
                    <div className="ml-2 text-sm font-medium text-slate-700">{s.difficulty ?? "Easy"}</div>
                    <div className="ml-auto flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={handleCopyLink} className="h-8">
                        Copy link
                      </Button>
                    </div>
                  </div>
              </div>

              {/* How it works */}
              <div className="rounded-md border border-slate-100 bg-white/60 p-4">
                <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <List className="h-4 w-4" /> How this works
                </h4>
                <ol className="mt-3 space-y-3 list-decimal list-inside text-sm text-slate-600">
                  <li>Read each question carefully and pick the option that best applies.</li>
                  <li>Most questions are multiple choice; some may ask for short text or a rating.</li>
                  <li>Submit your responses — we review and credit accepted entries within 24–48 hours.</li>
                </ol>
              </div>

              <Separator />

              {/* Question preview */}
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <List className="h-4 w-4" /> Question preview
                  </h3>
                  <div className="text-sm text-slate-500">Only a sample — full survey during take</div>
                </div>

                <div className="mt-4 space-y-3">
                  {Array.isArray((survey as any).data) && (survey as any).data.length > 0 ? (
                    (survey as any).data.map((q: any, idx: number) => {
                      const qKey = String(q.id ?? idx)
                      const selected = selectedPreview[qKey] ? Array.from(selectedPreview[qKey]) : []
                      return (
                        <article
                          key={q.id || idx}
                          className="rounded-md border border-slate-100 p-4 bg-white/50"
                          aria-labelledby={`q-${q.id || idx}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div id={`q-${q.id || idx}`} className="text-sm font-medium text-slate-900">
                                {q.text}
                              </div>
                              <div className="mt-2 text-xs text-slate-500">Question {idx + 1}</div>
                            </div>

                            <div className="text-xs text-slate-500 flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
                                {q.type === "single" && <CheckSquare className="h-3 w-3" />}
                                {q.type === "multi" && <CheckSquare className="h-3 w-3" />}
                                {q.type === "text" && <FileText className="h-3 w-3" />}
                                {q.type === "rating" && <Star className="h-3 w-3" />}
                                <span className="capitalize">{q.type}</span>
                              </span>
                            </div>
                          </div>

                          <div className="mt-3">
                            {q.type === "single" || q.type === "multi" ? (
                              <div className="flex flex-wrap gap-2">
                                {q.options?.map((o: string, i: number) => {
                                  const active = selected.includes(o)
                                  return (
                                    <button
                                      key={o + i}
                                      type="button"
                                      onClick={() => togglePreviewOption(qKey, o)}
                                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm focus:outline-none focus:ring-2 ${
                                        active
                                          ? "bg-amber-600 text-white border-amber-600"
                                          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                                      }`}
                                      aria-pressed={active}
                                    >
                                      {o}
                                    </button>
                                  )
                                })}
                              </div>
                            ) : q.type === "rating" ? (
                              <div className="text-sm text-slate-600">Rating: 1 — {q.scale ?? 5}</div>
                            ) : (
                              <div className="text-sm text-slate-600">Open-text response</div>
                            )}
                          </div>
                        </article>
                      )
                    })
                  ) : (
                    <div className="text-sm text-slate-500">No preview available.</div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="lg" className="rounded-2xl h-11" onClick={handleStart}>
                  Start Survey
                </Button>
                <Button variant="outline" size="lg" className="rounded-2xl h-11" onClick={handleBack}>
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <Card className="rounded-2xl border border-slate-200/60 bg-white/80 p-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="text-sm text-slate-600">Questions</div>
                <div className="text-lg font-bold text-slate-900">{Array.isArray((survey as any).data) ? (survey as any).data.length : "-"}</div>
              </div>
              <div className="text-sm text-slate-500">Preview</div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-slate-200/60 bg-white/80 p-4">
            <div className="text-sm text-slate-600">Estimated time</div>
            <div className="text-lg font-bold text-slate-900">{s.estimatedTime ?? 0} minutes</div>
          </Card>

          <Card className="rounded-2xl border border-slate-200/60 bg-white/80 p-4">
            <div className="text-sm text-slate-600">Reward</div>
            <div className="text-lg font-bold text-amber-600">{s.reward ?? 0} pts</div>
          </Card>
        </aside>
      </div>

      {/* Sticky mobile CTA */}
      <div className="sm:hidden">
        <div className="fixed inset-x-4 bottom-6 z-40 flex justify-center">
          <Button size="lg" className="w-full rounded-full h-12 shadow-lg" onClick={handleStart}>
            Start Survey — {s.reward ?? 0} pts
          </Button>
        </div>
      </div>

  {/* Toast */}
  <Toast title={toast.title} description={toast.description} open={toast.open} onOpenChange={(v) => toast.setOpen(v)} />
    </div>
  )
}
