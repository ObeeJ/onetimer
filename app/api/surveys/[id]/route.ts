import { NextResponse } from "next/server"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = params.id

  // Mixed question types
  const data = [
    { id: "q1", type: "single", text: "How often do you shop online?", options: ["Daily", "Weekly", "Monthly", "Rarely"] },
    { id: "q2", type: "multi", text: "Which categories do you buy most?", options: ["Groceries", "Electronics", "Fashion", "Beauty", "Home"] },
    { id: "q3", type: "text", text: "What could improve your shopping experience?" },
    { id: "q4", type: "rating", text: "Rate your satisfaction with delivery speed", scale: 5 },
    { id: "q5", type: "matrix", text: "Please rate the following:", rows: ["Price", "Quality", "Customer Support"], cols: ["Very Poor", "Poor", "Average", "Good", "Excellent"] },
  ]

  return NextResponse.json({
    data,
    survey: { id, title: `Survey ${id}`, description: "Help us understand your preferences." },
  })
}
