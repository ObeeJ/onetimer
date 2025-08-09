import { NextResponse } from "next/server"

export async function GET() {
  const data = Array.from({ length: 12 }).map((_, i) => ({
    id: String(i + 1),
    title: `Consumer Preferences ${i + 1}`,
    description: "Help brands understand your habits and preferences.",
    category: ["lifestyle", "finance", "tech", "health"][i % 4],
    estimatedTime: 5 + (i % 5),
    reward: 20 + (i % 10),
    eligible: i % 3 !== 0,
  }))
  return NextResponse.json({ data })
}
