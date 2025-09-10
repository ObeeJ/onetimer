"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, ArrowLeft } from "lucide-react"

export default function ImportSurveyPage() {
  const router = useRouter()
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  return (
    <div className="flex-1 min-w-0 overflow-auto">
      <div className="mx-auto max-w-4xl space-y-8 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Import Survey</h1>
            <p className="text-slate-600">Upload an existing survey or create from template</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Survey File
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-[#C1654B] bg-orange-50' 
                    : 'border-slate-300 hover:border-slate-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-2">
                  Drag and drop your survey file here, or click to browse
                </p>
                <p className="text-sm text-slate-500 mb-4">
                  Supports: JSON, CSV, Excel, Word, PDF
                </p>
                <Input
                  type="file"
                  accept=".json,.csv,.xlsx,.xls,.docx,.doc,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" className="cursor-pointer">
                    Choose File
                  </Button>
                </label>
              </div>
              
              {file && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <FileText className="h-5 w-5 text-slate-500" />
                  <span className="text-sm text-slate-700">{file.name}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setFile(null)}
                    className="ml-auto text-slate-500 hover:text-slate-700"
                  >
                    ×
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Create from Text
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Survey Title</label>
                <Input placeholder="Enter survey title" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Survey Description</label>
                <Textarea 
                  placeholder="Describe your survey..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Questions (one per line)</label>
                <Textarea 
                  placeholder="What is your age?&#10;How satisfied are you with our service?&#10;Any additional comments?"
                  className="min-h-[120px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { name: "Customer Satisfaction", questions: 8, time: "5 min" },
                { name: "Product Feedback", questions: 12, time: "7 min" },
                { name: "Market Research", questions: 15, time: "10 min" }
              ].map((template) => (
                <Card key={template.name} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">{template.name}</h3>
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>{template.questions} questions</span>
                      <span>{template.time}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button variant="creator" className="px-8">
            Import Survey
          </Button>
        </div>
      </div>
    </div>
  )
}