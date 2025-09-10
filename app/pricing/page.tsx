import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, ArrowRight } from "lucide-react"
import { AnimatedLogo } from "@/components/ui/animated-logo"
import { AnimatedBackground } from "@/components/ui/animated-background"
import { Footer } from "@/components/ui/footer"

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      price: "₦15,000",
      period: "one-time",
      description: "Perfect for small businesses and researchers",
      features: [
        "Up to 100 survey responses",
        "Basic analytics dashboard",
        "Email support",
        "Standard question types",
        "CSV data export"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Professional",
      price: "₦45,000",
      period: "one-time",
      description: "Ideal for growing companies and detailed research",
      features: [
        "Up to 500 survey responses",
        "Advanced analytics & insights",
        "Priority email support",
        "All question types",
        "Multiple export formats",
        "Custom branding",
        "Skip logic & branching"
      ],
      cta: "Get Started",
      popular: true
    },
    {
      name: "Enterprise",
      price: "₦120,000",
      period: "one-time",
      description: "For large organizations with extensive research needs",
      features: [
        "Up to 2,000 survey responses",
        "Premium analytics suite",
        "Dedicated account manager",
        "All advanced features",
        "API access",
        "White-label solution",
        "Custom integrations",
        "Phone support"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Navigation */}
      <nav className="border-b border-slate-200 relative z-10 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <AnimatedLogo />
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="navbar-item text-slate-600 hover:text-slate-900">
                  Sign in
                </Button>
              </Link>
              <Link href="/auth/role-selection">
                <Button className="bg-[#013F5C] hover:bg-[#012d42] text-white">
                  Get started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6 fade-in-up">
            Simple, transparent
            <span className="text-[#C1654B] block">pricing</span>
          </h1>
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto fade-in-up" style={{animationDelay: '0.2s'}}>
            Choose the perfect plan for your research needs. No hidden fees, no monthly subscriptions.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card 
                key={plan.name} 
                className={`relative card-hover ${plan.popular ? 'ring-2 ring-[#C1654B] scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#C1654B] text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold text-slate-900 mb-2">
                    {plan.name}
                  </CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-[#013F5C]">{plan.price}</span>
                    <span className="text-slate-600 ml-2">/{plan.period}</span>
                  </div>
                  <p className="text-slate-600">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/creator/onboarding" className="block">
                    <Button 
                      className={`w-full ${plan.popular 
                        ? 'bg-[#C1654B] hover:bg-[#a55440]' 
                        : 'bg-[#013F5C] hover:bg-[#012d42]'
                      } text-white group`}
                    >
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#013F5C] relative">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to start collecting insights?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of businesses using OneTime Survey for market research
          </p>
          <Link href="/creator/onboarding">
            <Button size="lg" className="bg-[#C1654B] hover:bg-[#a55440] text-white px-8 py-4 text-lg font-semibold group">
              Start creating surveys
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}