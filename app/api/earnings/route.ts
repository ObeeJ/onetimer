import { NextResponse } from "next/server"

export async function GET() {
  const balance = 1230
  const history = [
    { id: "e1", points: 300, date: new Date().toISOString(), source: "Survey #12" },
    { id: "e2", points: 450, date: new Date(Date.now() - 864e5).toISOString(), source: "Survey #05" },
    { id: "e3", points: 480, date: new Date(Date.now() - 2 * 864e5).toISOString(), source: "Referral bonus" },
  ]
  return NextResponse.json({ balance, history })
}
