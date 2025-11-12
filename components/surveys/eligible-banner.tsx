"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { BadgeCheck } from 'lucide-react'
import { useEffect, useState } from "react"
import { api } from "@/hooks/use-api"

export default function EligibleBanner() {
  const [eligible, setEligible] = useState<boolean | null>(null)
  useEffect(() => {
    api.post<{ eligible: boolean }>("/eligibility").then((r) => setEligible(r.eligible))
  }, [])
  if (eligible === null) return null
  if (!eligible) return null
  return (
    <Alert>
      <BadgeCheck className="h-4 w-4" />
      <AlertTitle>You're eligible for new surveys</AlertTitle>
      <AlertDescription>We found a set of surveys you can take now.</AlertDescription>
    </Alert>
  )
}
