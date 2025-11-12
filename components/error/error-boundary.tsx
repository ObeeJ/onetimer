"use client"

import { Component, ReactNode, ErrorInfo } from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { logger } from "@/lib/logger"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  routeName?: string
}

interface State {
  hasError: boolean
  error?: Error
  errorId: string
}

interface ErrorFallbackProps {
  error?: Error
  errorId: string
  onReset: () => void
}

function ErrorFallback({ error, errorId, onReset }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h1>
        <p className="text-slate-600 mb-4">
          {error?.message || "We encountered an unexpected error."}
        </p>
        <p className="text-xs text-slate-500 mb-6">
          Error ID: <code className="bg-slate-100 px-2 py-1 rounded">{errorId}</code>
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={onReset} className="bg-[#013F5C] hover:bg-[#0b577a]">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      errorId: this.generateErrorId(),
    }
  }

  private generateErrorId(): string {
    return `ERR_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: `ERR_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Component Error Boundary Triggered', error, {
      errorId: this.state.errorId,
      componentStack: errorInfo.componentStack,
      routeName: this.props.routeName,
      timestamp: new Date().toISOString()
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <ErrorFallback
            error={this.state.error}
            errorId={this.state.errorId}
            onReset={this.handleReset}
          />
        )
      )
    }

    return this.props.children
  }
}