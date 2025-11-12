"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardHeader } from "@/components/ui/card"
import { Coins, CheckCircle, Loader2 } from 'lucide-react'
import { useSurvey, useSaveProgress } from "@/hooks/use-surveys"
import SurveyProgress from "@/components/surveys/survey-progress"
import { useDebounce } from '@/hooks/use-debounce'

const SaveStatusIndicator = ({ status }: { status: string }) => {
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
  const { data: survey } = useSurvey(params.id)
  const [answers] = useState<Record<string, string>>({})
  const [idx] = useState(0)
  const { mutate: saveProgress } = useSaveProgress()
  const [saveStatus, setSaveStatus] = useState('idle')

  const progress = useMemo(() => {
    if (!survey?.questions?.length) return 0;
    return ((idx + 1) / survey.questions.length) * 100;
  }, [idx, survey]);

  const debouncedAnswers = useDebounce(answers, 2000);

  useEffect(() => {
    if (Object.keys(debouncedAnswers).length > 0) {
      setSaveStatus('saving');
      const responses = Object.entries(debouncedAnswers).map(([questionId, answer]) => ({
        question_id: questionId,
        answer
      }));
      saveProgress({
        surveyId: params.id,
        responses
      }, {
        onSuccess: () => setTimeout(() => setSaveStatus('saved'), 500),
        onError: () => setSaveStatus('idle'),
      });
    }
  }, [debouncedAnswers, saveProgress, params.id]);

  // TODO: Implement survey questions rendering and submission logic
  if (!survey) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <Card className="rounded-2xl shadow-lg border-0">
          <CardHeader>
            <p className="text-slate-600">Loading survey...</p>
          </CardHeader>
        </Card>
      </div>
    );
  }

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
      </Card>

      {/* TODO: Implement survey questions display */}
      <div className="mt-6 text-center text-slate-600">
        <p>Survey implementation coming soon...</p>
      </div>
    </div>
  )
}
