import LandingHeader from "@/components/landing/landing-header"
import Hero from "@/components/landing/hero"
import Features from "@/components/landing/features"
import CTA from "@/components/landing/cta"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#013f5c]">
      <LandingHeader />
      <Hero />
      <Features />
      <CTA />
    </div>
  )
}
