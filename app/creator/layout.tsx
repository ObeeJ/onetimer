import type React from "react"
import type { Metadata } from "next"
import CreatorLayout from "@/layouts/creator-layout"

export const metadata: Metadata = {
  title: "Survey Creator | OneTime Survey",
  description: "Create surveys and collect valuable insights from our community.",
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <CreatorLayout>{children}</CreatorLayout>
}