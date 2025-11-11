import type React from "react"
import type { Metadata } from "next"
import FillerLayout from "@/layouts/filler-layout"
import { ErrorBoundary } from "@/components/error/error-boundary"

export const metadata: Metadata = {
  title: "Survey Filler | Dashboard",
  description: "Earn from surveys. Minimal, modern, fast PWA.",
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary routeName="filler">
      <FillerLayout>{children}</FillerLayout>
    </ErrorBoundary>
  )
}
