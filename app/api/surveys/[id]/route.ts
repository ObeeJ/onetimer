import { NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  const survey = {
    id,
    title: `Consumer Preferences ${id}`,
    description: "Help brands understand your habits and preferences through this detailed survey.",
    category: ["lifestyle", "finance", "tech", "health"][parseInt(id) % 4],
    estimatedTime: 5 + (parseInt(id) % 5),
    reward: 20 + (parseInt(id) % 10),
    eligible: parseInt(id) % 3 !== 0,
    questions: [
      {
        id: "q1",
        type: "multiple-choice",
        question: "What is your age group?",
        options: ["18-25", "26-35", "36-45", "46-55", "55+"]
      },
      {
        id: "q2", 
        type: "text",
        question: "What factors influence your purchasing decisions?"
      }
    ]
  }
  
  return NextResponse.json({ data: survey })
}