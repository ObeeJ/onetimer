"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CATEGORIES } from "@/utils/constants"

export function CategoryFilter({
  value = "all",
  onChange,
}: {
  value?: string
  onChange?: (_v: string) => void
}) {
  return (
    <Tabs value={value} onValueChange={onChange} className="w-full">
      <TabsList className="flex w-full flex-wrap justify-start gap-2">
        {["all", ...CATEGORIES].map((c) => (
          <TabsTrigger key={c} value={c} className="capitalize">
            {c}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
