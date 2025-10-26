import { Badge } from "@/components/ui/badge"
import { Rocket } from "lucide-react"

export function BetaBanner() {
  return (
    <div className="bg-orange-100 border-b border-orange-200 text-orange-800 text-sm overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative h-8 flex items-center justify-center">
          <div className="animate-marquee whitespace-nowrap flex">
            <span className="mx-4">
              <Rocket className="inline-block h-4 w-4 mr-2" />
              <Badge variant="outline" className="mr-2 border-orange-400 text-orange-800">
                Beta
              </Badge>
              We are currently in beta testing. Some features may not be fully functional. We are about to launch with proper UX.
            </span>
            <span className="mx-4">
              <Rocket className="inline-block h-4 w-4 mr-2" />
              <Badge variant="outline" className="mr-2 border-orange-400 text-orange-800">
                Beta
              </Badge>
              We are currently in beta testing. Some features may not be fully functional. We are about to launch with proper UX.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}