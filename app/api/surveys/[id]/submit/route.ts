import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const body = await request.json()
  
  return NextResponse.json({ 
    success: true, 
    message: "Survey submitted successfully",
    points: 20 + (parseInt(id) % 10)
  })
}