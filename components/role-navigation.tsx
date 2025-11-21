"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function RoleNavigation() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Link href="/auth/login?role=filler">
        <Button variant="outline" size="lg" className="w-full sm:w-auto">
          Sign in as Filler
        </Button>
      </Link>
      <Link href="/auth/login?role=creator">
        <Button variant="outline" size="lg" className="w-full sm:w-auto">
          Sign in as Creator
        </Button>
      </Link>
      <Link href="/filler/onboarding">
        <Button size="lg" className="w-full sm:w-auto bg-[#013F5C] hover:bg-[#012d42]">
          Join as Filler
        </Button>
      </Link>
      <Link href="/creator/onboarding">
        <Button size="lg" className="w-full sm:w-auto bg-[#C1654B] hover:bg-[#a54d3a]">
          Join as Creator
        </Button>
      </Link>
    </div>
  )
}
