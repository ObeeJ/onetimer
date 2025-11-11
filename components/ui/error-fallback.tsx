"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { ApiError } from "@/lib/error-handler"

interface ErrorFallbackProps {
  error?: ApiError | Error
  onRetry?: () => void
  title?: string
}

export function ErrorFallback({ error, onRetry, title = "Something went wrong" }: ErrorFallbackProps) {
  const isApiError = error && 'status' in error
  const message = isApiError 
    ? (error as ApiError).message 
    : error?.message || "An unexpected error occurred"

  return (
    <Card className="mx-auto max-w-md">
      <CardContent className="pt-6 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 mb-4">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try again
          </Button>
        )}
      </CardContent>
    </Card>
  )
}