import { NextResponse } from "next/server"

export async function POST() {
  // Paystack placeholder:
  // Replace with a server call to initialize a Paystack payout or transfer.
  return NextResponse.json({ ok: true, ref: `ps_${Math.random().toString(36).slice(2, 10)}` })
}
