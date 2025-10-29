"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Coins, Star, CheckCircle, ArrowLeft, ArrowRight, Save, Loader2 } from 'lucide-react'
import { useRouter } from "next/navigation"
import { useSubmitSurvey, useSurvey, useSaveProgress } from "@/hooks/use-surveys"
import { useToast } from "@/hooks/use-toast"
import SurveyProgress from "@/components/surveys/survey-progress"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { useDebounce } from '@/hooks/use-debounce'

// ... (SurveyCompletedScreen and type definitions remain the same)

const SaveStatusIndicator = ({ status }) => {
  let content = null;
  switch (status) {
    case 'saving':
      content = <><Loader2 className="h-3 w-3 animate-spin" /> Saving...</>;
      break;
    case 'saved':
      content = <><CheckCircle className="h-3 w-3" /> Saved</>;
      break;
    default:
      content = <>Last saved a few seconds ago</>;
  }
  return <div className="text-xs text-slate-500 flex items-center gap-1">{content}</div>;
};

export default function TakeSurveyPage({ params }: { params: { id: string } }) {
  const { data: survey, isLoading: surveyLoading, error, refetch } = useSurvey(params.id)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [idx, setIdx] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const router = useRouter()
  const { mutate: submitSurvey, isPending: isSubmitting } = useSubmitSurvey()
  const { mutate: saveProgress } = useSaveProgress()
  const { toast } = useToast()
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved
  const progress = useMemo(() => {
    if (!survey?.questions?.length) return 0;
    return ((idx + 1) / survey.questions.length) * 100;
  }, [idx, survey]);

  const debouncedAnswers = useDebounce(answers, 2000); // Debounce answers with a 2-second delay

  useEffect(() => {
    if (Object.keys(debouncedAnswers).length > 0) {
      setSaveStatus('saving');
      const responses = Object.entries(debouncedAnswers).map(([questionId, answer]) => ({ question_id: questionId, answer }));
      saveProgress({ surveyId: params.id, responses }, {
        onSuccess: () => setTimeout(() => setSaveStatus('saved'), 500),
        onError: () => setSaveStatus('idle'), // Or show an error state
      });
    }
  }, [debouncedAnswers, saveProgress, params.id]);

  // ... (rest of the component logic: isValid, submit, renderQuestion)

  // ... (return statement with JSX)
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="rounded-2xl shadow-lg border-0">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-slate-900">{survey?.title}</h2>
            <div className="inline-flex items-center gap-1 text-sm font-medium text-green-600">
              <Coins className="h-4 w-4" />
              {survey?.reward} Points
            </div>
          </div>
          <SurveyProgress value={progress} />
          <div className="text-right mt-1">
            <SaveStatusIndicator status={saveStatus} />
          </div>
        </CardHeader>
        {/* ... CardContent and CardFooter ... */}
      </Card>
    </div>
  )
}


