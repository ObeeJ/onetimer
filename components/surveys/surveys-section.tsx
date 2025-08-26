"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
// categories removed - render all surveys
import SurveyCard from "./survey-card"
import type { Survey } from "@/types/survey"
import { useAvailableSurveys } from "@/hooks/use-user-api"

export default function SurveysSection() {
  const { surveys, loading, error, refetch } = useAvailableSurveys()
  // categories removed
  const reduce = useReducedMotion()

  const filtered = useMemo(() => surveys, [surveys])

  if (loading) {
    return (
      <div className="space-y-6" id="surveys">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6" id="surveys">
        <div className="rounded-lg border bg-red-50 p-4 text-red-700">
          Error loading surveys: {error}
          <button 
            onClick={refetch}
            className="ml-2 text-red-600 underline hover:text-red-800"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6" id="surveys">
      {/* category filter removed */}
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
              className="h-full min-w-0"
            >
              <SurveyCard survey={survey} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
