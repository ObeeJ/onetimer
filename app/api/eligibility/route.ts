import { NextResponse } from "next/server"

export async function POST() {
  // Mock gRPC eligibility check
  const eligible = Math.random() > 0.2
  return NextResponse.json({ eligible })
}
