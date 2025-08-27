"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { CategoryFilter } from "./surveys-toolbar"
import SurveyCard from "./survey-card"
import type { Survey } from "@/types/survey"
import { fetchJSON } from "@/hooks/use-api"

export default function SurveysSection() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [cat, setCat] = useState<string>("all")
  const reduce = useReducedMotion()

  useEffect(() => {
    let mounted = true
    fetchJSON<{ data: Survey[] }>("/api/surveys").then((res) => {
      if (mounted) setSurveys(res.data)
    })
    return () => {
      mounted = false
    }
  }, [])

  const filtered = useMemo(() => (cat === "all" ? surveys : surveys.filter((s) => s.category === cat)), [cat, surveys])

  return (
    <div className="space-y-6" id="surveys">
      <CategoryFilter value={cat} onChange={setCat} />
      <AnimatePresence mode="popLayout">
        <motion.div
          layout
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          transition={reduce ? { duration: 0 } : undefined}
        >
          {filtered.map((survey) => (
            <motion.div
              layout
              key={survey.id}
              initial={reduce ? false : { opacity: 0, y: 20, scale: 0.95 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -20, scale: 0.95 }}
              transition={
                reduce
                  ? { duration: 0.1 }
                  : {
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                      mass: 0.8,
                      opacity: { duration: 0.2 },
                    }
              }
              className="h-full"
            >
              <SurveyCard survey={survey} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
