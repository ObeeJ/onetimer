import { Suspense } from "react"
import SurveysSection from "@/components/surveys/surveys-section"
import SurveysSkeleton from "@/components/skeletons/surveys-skeleton"

export default function Page() {
  return (
    <div className="container mx-auto space-y-6 p-4 md:p-6">
      <h1 className="text-xl font-semibold">Surveys</h1>
      <Suspense fallback={<SurveysSkeleton />}>
        <SurveysSection />
      </Suspense>
    </div>
  )
}
