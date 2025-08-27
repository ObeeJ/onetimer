import { NextResponse } from "next/server"

export async function POST() {
  // AWS SES verification placeholder:
  // Replace with backend verification that checks the submitted code.
  return NextResponse.json({ ok: true, verified: true })
}
