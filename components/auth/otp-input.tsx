"use client"

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"

export default function OTPInput({ length = 6, onComplete }: { length?: number; onComplete?: (code: string) => void }) {
  const [values, setValues] = useState(Array.from({ length }, () => ""))
  const refs = useRef<HTMLInputElement[]>([])

  useEffect(() => {
    refs.current[0]?.focus()
  }, [])

  useEffect(() => {
    const code = values.join("")
    if (onComplete) {
      onComplete(code)
    }
  }, [values, onComplete])

  return (
    <div className="flex gap-2">
      {values.map((v, i) => (
        <Input
          key={i}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          className="h-12 w-12 text-center"
          maxLength={1}
          value={v}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "")
            setValues((prev) => {
              const copy = [...prev]
              copy[i] = val
              return copy
            })
            if (val && i < length - 1) refs.current[i + 1]?.focus()
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !values[i] && i > 0) refs.current[i - 1]?.focus()
          }}
          ref={(el) => {
            if (el) refs.current[i] = el
          }}
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  )
}
