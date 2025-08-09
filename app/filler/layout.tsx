import type { Metadata } from "next"
import FillerLayout from "@/layouts/filler-layout"

export const metadata: Metadata = {
  title: "Survey Filler | Dashboard",
  description: "Earn from surveys. Minimal, modern, fast PWA.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <FillerLayout>{children}</FillerLayout>
}
