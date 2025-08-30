import { NextRequest, NextResponse } from "next/server"

export async function POST(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  
  return NextResponse.json({ 
    success: true, 
    message: "Survey submitted successfully",
    points: 20 + (parseInt(id) % 10)
  })
}