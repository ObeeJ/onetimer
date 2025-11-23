import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/analytics/dashboard`, {
      method: 'GET',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Cookie': request.headers.get('Cookie') || '',
      },
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json(data)
    }

    // Return mock data if backend fails
    return NextResponse.json({
      stats: [
        {
          title: "Total Earnings",
          value: "₦24,750",
          change: "+12.5%",
          color: "text-green-600"
        },
        {
          title: "Surveys Completed", 
          value: "23",
          change: "+3 this week",
          color: "text-blue-600"
        },
        {
          title: "Referrals",
          value: "8", 
          change: "+2 this month",
          color: "text-purple-600"
        },
        {
          title: "Success Rate",
          value: "94%",
          change: "+2.1%", 
          color: "text-orange-600"
        }
      ]
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 })
  }
}