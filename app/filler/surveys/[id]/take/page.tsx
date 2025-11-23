"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardHeader } from "@/components/ui/card"
import { Coins, CheckCircle, Loader2 } from 'lucide-react'
import { useSurvey, useSaveProgress } from "@/hooks/use-surveys"
import SurveyProgress from "@/components/surveys/survey-progress"
import { useDebounce } from '@/hooks/use-debounce'
import { useRouter } from "next/navigation"

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
  const router = useRouter()
  const { data: survey } = useSurvey(params.id)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [idx, setIdx] = useState(0)
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

  // Check for invalid survey ID and redirect
  useEffect(() => {
    if (!params.id || params.id === 'undefined' || params.id === 'null') {
      router.replace('/filler/surveys')
    }
  }, [params.id, router])

  // Don't render anything if ID is invalid
  if (!params.id || params.id === 'undefined' || params.id === 'null') {
    return null
  }

  const currentSurvey = survey || {
    id: params.id,
    title: "Sample Survey",
    description: "Please answer the following questions",
    reward: 150,
    questions: [
      { id: "1", type: "multiple_choice", title: "What is your age group?", options: ["18-25", "26-35", "36-45", "45+"] },
      { id: "2", type: "text", title: "What do you think about our service?" },
      { id: "3", type: "rating", title: "Rate your experience (1-5)" }
    ]
  }

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleNext = () => {
    if (currentSurvey?.questions && idx < currentSurvey.questions.length - 1) {
      setIdx(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (idx > 0) {
      setIdx(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch(`/api/surveys/${params.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      })
      if (response.ok) {
        router.push('/filler/surveys?completed=true')
      }
    } catch (error) {
      console.error('Failed to submit survey:', error)
    }
  }

  if (!currentSurvey) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <Card className="rounded-2xl shadow-lg border-0">
          <CardHeader>
            <p className="text-slate-600">Loading survey...</p>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const currentQuestion = currentSurvey?.questions?.[idx]
  const isLastQuestion = idx === (currentSurvey?.questions?.length || 0) - 1

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="rounded-2xl shadow-lg border-0">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-slate-900">{currentSurvey.title}</h2>
            <div className="inline-flex items-center gap-1 text-sm font-medium text-green-600">
              <Coins className="h-4 w-4" />
              {currentSurvey.reward} Points
            </div>
          </div>
          <SurveyProgress value={progress} />
          <div className="text-right mt-1">
            <SaveStatusIndicator status={saveStatus} />
          </div>
        </CardHeader>
      </Card>

      {/* Survey Question */}
      <Card className="mt-6 rounded-2xl shadow-lg border-0">
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Question {idx + 1} of {currentSurvey?.questions?.length || 0}
            </h3>
            <p className="text-lg text-slate-700">{(currentQuestion as any)?.title || 'Question'}</p>
          </div>

          {/* Question Input */}
          <div className="mb-8">
            {currentQuestion?.type === 'multiple_choice' && (
              <div className="space-y-3">
                {currentQuestion?.options?.map((option: string, optionIdx: number) => (
                  <label key={optionIdx} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name={`question_${currentQuestion?.id}`}
                      value={option}
                      checked={answers[currentQuestion?.id || ''] === option}
                      onChange={(e) => currentQuestion?.id && handleAnswerChange(currentQuestion.id, e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-slate-700">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion?.type === 'text' && (
              <textarea
                className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Type your answer here..."
                value={answers[currentQuestion?.id || ''] || ''}
                onChange={(e) => currentQuestion?.id && handleAnswerChange(currentQuestion.id, e.target.value)}
              />
            )}

            {currentQuestion?.type === 'rating' && (
              <div className="flex space-x-4">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => currentQuestion?.id && handleAnswerChange(currentQuestion.id, rating.toString())}
                    className={`w-12 h-12 rounded-full border-2 font-semibold transition-colors ${
                      answers[currentQuestion?.id || ''] === rating.toString()
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-slate-300 text-slate-600 hover:border-blue-400'
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={idx === 0}
              className="px-6 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {isLastQuestion ? (
              <button
                onClick={handleSubmit}
                disabled={!answers[currentQuestion?.id || '']}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Survey
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!answers[currentQuestion?.id || '']}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
