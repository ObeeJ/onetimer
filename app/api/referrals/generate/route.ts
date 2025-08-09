import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const url = new URL(req.url)
  const token = Math.random().toString(36).slice(2, 8)
  const link = `${url.origin}/filler/auth/sign-up?ref=${token}`
  return NextResponse.json({ link })
}
