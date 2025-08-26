import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col">
      <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-4">
          <Logo 
            size="md" 
            showText={true} 
            href="/"
            textClassName="text-[#013F5C]"
            priority={true}
          />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-[#013F5C]">404</h1>
            <h2 className="text-xl font-semibold text-slate-700">Page Not Found</h2>
            <p className="text-slate-600">
              Sorry, we couldn't find the page you're looking for. The page may have been moved or deleted.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="bg-[#013F5C] hover:bg-[#0b577a] text-white">
              <Link href="/">Go Home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/filler">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
