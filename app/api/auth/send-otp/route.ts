import { NextResponse } from "next/server"

export async function POST() {
  // AWS SES placeholder:
  // Replace with a POST to your backend service that triggers SES to send an email OTP.
  // e.g. POST /v1/auth/otp { email, phone }
  return NextResponse.json({ ok: true, channel: "email" })
}
