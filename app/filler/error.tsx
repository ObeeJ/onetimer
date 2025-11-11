"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, Home } from "lucide-react"

export default function FillerError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error("Filler dashboard error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Filler Dashboard Error</h1>
          <p className="text-slate-600 mb-6">
            An error occurred in the filler dashboard. Please try again or contact support if the problem persists.
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={reset} className="bg-[#013F5C] hover:bg-[#012d42]">
              Try Again
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/filler")}
                className="flex-1"
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="flex-1"
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
