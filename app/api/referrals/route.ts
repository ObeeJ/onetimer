import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const url = new URL(req.url)
  if (url.searchParams.get("list")) {
    const users = Array.from({ length: 6 }).map((_, i) => ({
      id: `r${i}`,
      name: `User ${i + 1}`,
      joinedAt: new Date(Date.now() - i * 864e5).toISOString(),
      points: 50 + i * 10,
    }))
    return NextResponse.json({ users })
  }
  const link = `${url.origin}/filler/auth/sign-up?ref=abc123`
  return NextResponse.json({ link })
}
