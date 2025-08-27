import { NextResponse } from "next/server"

export async function POST() {
  // Accept answers, persist later with Go backend.
  return NextResponse.json({ ok: true, awarded: 50 })
}
