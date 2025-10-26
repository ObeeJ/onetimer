"use client"

import { useState } from "react"
import { Download, FileText, Database, FileImage, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface ExportDialogProps {
  surveyId: string
  surveyTitle: string
  responseCount: number
}

export function ExportDialog({ surveyId, surveyTitle, responseCount }: ExportDialogProps) {
  const [format, setFormat] = useState("csv")
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      const response = await fetch(`/api/surveys/${surveyId}/export?format=${format}`)
      
      if (!response.ok) throw new Error("Export failed")
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      
      a.href = url
      a.download = `${surveyTitle.replace(/[^a-zA-Z0-9]/g, "_")}_responses.${format}`
      document.body.appendChild(a)
      a.click()
      
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Export error:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Survey Responses</DialogTitle>
          <DialogDescription>
            Download {responseCount} responses for "{surveyTitle}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <RadioGroup value={format} onValueChange={setFormat}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="csv" id="csv" />
              <Label htmlFor="csv" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                CSV Format
                <span className="text-sm text-muted-foreground">
                  (Excel compatible)
                </span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="json" id="json" />
              <Label htmlFor="json" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                JSON Format
                <span className="text-sm text-muted-foreground">
                  (Developer friendly)
                </span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pdf" id="pdf" />
              <Label htmlFor="pdf" className="flex items-center gap-2">
                <FileImage className="h-4 w-4" />
                PDF Format
                <span className="text-sm text-muted-foreground">
                  (Print ready)
                </span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="docx" id="docx" />
              <Label htmlFor="docx" className="flex items-center gap-2">
                <File className="h-4 w-4" />
                DOCX Format
                <span className="text-sm text-muted-foreground">
                  (Word document)
                </span>
              </Label>
            </div>
          </RadioGroup>
          
          <Button 
            onClick={handleExport} 
            disabled={isExporting || responseCount === 0}
            className="w-full"
          >
            {isExporting ? "Exporting..." : `Download ${format.toUpperCase()}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}