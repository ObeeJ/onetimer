"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import SurveyBuilder from "@/components/creator/survey-builder"
import { fetchJSON } from "@/hooks/use-api"
import { useRouter } from "next/navigation"
import { 
  Save, 
  Send, 
  FileText, 
  Users, 
  Settings, 
  Eye,
  ArrowLeft,
  DollarSign,
  Target,
  Clock,
  CheckCircle2
} from "lucide-react"

export default function CreatorCreatePage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [target, setTarget] = useState("")
  const [reward, setReward] = useState(100)
  const [budget, setBudget] = useState(1000)
  const [estimatedTime, setEstimatedTime] = useState(5)
  const [category, setCategory] = useState("")
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("basics")
  const router = useRouter()

  const handleSaveDraft = async () => {
    setLoading(true)
    try {
      await fetchJSON("/api/creator/surveys", { 
        method: "POST", 
        body: JSON.stringify({ 
          title, 
          description, 
          target, 
          reward, 
          budget, 
          estimatedTime,
          category,
          status: "draft", 
          questions 
        }) 
      })
      router.push("/creator/dashboard")
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitForReview = async () => {
    setLoading(true)
    try {
      await fetchJSON("/api/creator/surveys", { 
        method: "POST", 
        body: JSON.stringify({ 
          title, 
          description, 
          target, 
          reward, 
          budget, 
          estimatedTime,
          category,
          status: "pending", 
          questions 
        }) 
      })
      router.push("/creator/dashboard")
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = title && description && questions.length > 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Create New Survey</h1>
            <p className="text-slate-600 mt-1">Build and launch your survey in minutes</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm ${
            activeTab === "basics" ? "bg-[#013F5C] text-white" : "bg-slate-100 text-slate-600"
          }`}>
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Survey Details</span>
            <span className="sm:hidden">1</span>
          </div>
          <div className="w-8 h-px bg-slate-300"></div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm ${
            activeTab === "questions" ? "bg-[#013F5C] text-white" : "bg-slate-100 text-slate-600"
          }`}>
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Questions</span>
            <span className="sm:hidden">2</span>
          </div>
          <div className="w-8 h-px bg-slate-300"></div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm ${
            activeTab === "settings" ? "bg-[#013F5C] text-white" : "bg-slate-100 text-slate-600"
          }`}>
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
            <span className="sm:hidden">3</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="hidden" />
        
        {/* Survey Basics */}
        <TabsContent value="basics" className="space-y-6">
          <Card className="rounded-2xl border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Survey Details
              </CardTitle>
              <p className="text-sm text-slate-600">Basic information about your survey</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <Label className="text-sm font-medium text-slate-700">Survey Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a clear, descriptive title for your survey"
                    className="mt-2 rounded-xl border-slate-300 focus:border-[#013F5C] focus:ring-[#013F5C]/20"
                  />
                </div>

                <div className="lg:col-span-2">
                  <Label className="text-sm font-medium text-slate-700">Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe what your survey is about and why responses matter"
                    className="mt-2 rounded-xl border-slate-300 focus:border-[#013F5C] focus:ring-[#013F5C]/20 min-h-[100px]"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700">Category</Label>
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Market Research, Customer Feedback"
                    className="mt-2 rounded-xl border-slate-300 focus:border-[#013F5C] focus:ring-[#013F5C]/20"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Estimated Time (minutes)
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="60"
                    value={String(estimatedTime)}
                    onChange={(e) => setEstimatedTime(Number(e.target.value))}
                    className="mt-2 rounded-xl border-slate-300 focus:border-[#013F5C] focus:ring-[#013F5C]/20"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => setActiveTab("questions")}
                  disabled={!title || !description}
                  className="rounded-xl bg-[#013F5C] hover:bg-[#0b577a]"
                >
                  Next: Add Questions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Questions */}
        <TabsContent value="questions" className="space-y-6">
          <Card className="rounded-2xl border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Survey Questions
              </CardTitle>
              <p className="text-sm text-slate-600">Add and configure your survey questions</p>
            </CardHeader>
            <CardContent>
              <SurveyBuilder value={questions} onChange={(q) => setQuestions(q)} />
              
              <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
                <Button 
                  variant="outline"
                  onClick={() => setActiveTab("basics")}
                  className="rounded-xl"
                >
                  Back
                </Button>
                <Button 
                  onClick={() => setActiveTab("settings")}
                  disabled={questions.length === 0}
                  className="rounded-xl bg-[#013F5C] hover:bg-[#0b577a]"
                >
                  Next: Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="rounded-2xl border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Survey Settings
              </CardTitle>
              <p className="text-sm text-slate-600">Configure targeting and budget settings</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Target Audience
                  </Label>
                  <Textarea
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder='Describe your target demographic, e.g., "Adults aged 25-45 in Lagos and Abuja interested in technology"'
                    className="mt-2 rounded-xl border-slate-300 focus:border-[#013F5C] focus:ring-[#013F5C]/20 min-h-[80px]"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Describe who should take this survey for best results
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Reward per Response (₦)
                  </Label>
                  <Input
                    type="number"
                    min="50"
                    max="5000"
                    step="50"
                    value={String(reward)}
                    onChange={(e) => setReward(Number(e.target.value))}
                    className="mt-2 rounded-xl border-slate-300 focus:border-[#013F5C] focus:ring-[#013F5C]/20"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Amount paid per completed response
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700">Total Budget (₦)</Label>
                  <Input
                    type="number"
                    min="1000"
                    step="500"
                    value={String(budget)}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="mt-2 rounded-xl border-slate-300 focus:border-[#013F5C] focus:ring-[#013F5C]/20"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Expected responses: ~{Math.floor(budget / reward)}
                  </p>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Survey Summary
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-slate-600">Questions</div>
                    <div className="font-semibold text-slate-900">{questions.length}</div>
                  </div>
                  <div>
                    <div className="text-slate-600">Est. Time</div>
                    <div className="font-semibold text-slate-900">{estimatedTime}min</div>
                  </div>
                  <div>
                    <div className="text-slate-600">Reward</div>
                    <div className="font-semibold text-slate-900">₦{reward}</div>
                  </div>
                  <div>
                    <div className="text-slate-600">Max Responses</div>
                    <div className="font-semibold text-slate-900">{Math.floor(budget / reward)}</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  variant="outline"
                  onClick={() => setActiveTab("questions")}
                  className="rounded-xl flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSaveDraft}
                  disabled={loading || !isFormValid}
                  variant="outline"
                  className="rounded-xl flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Saving..." : "Save Draft"}
                </Button>
                <Button
                  onClick={handleSubmitForReview}
                  disabled={loading || !isFormValid}
                  className="rounded-xl bg-[#013F5C] hover:bg-[#0b577a] flex-1"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? "Submitting..." : "Submit for Review"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
