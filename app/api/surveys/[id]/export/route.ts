import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    
    // Proxy to backend
    const response = await fetch(`${process.env.BACKEND_URL}/api/creator/surveys/${params.id}/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify({ format }),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to export survey' },
        { status: response.status }
      )
    }

    const data = await response.blob()
    
    return new NextResponse(data, {
      headers: {
        'Content-Type': format === 'csv' ? 'text/csv' : 'application/json',
        'Content-Disposition': `attachment; filename="survey-${params.id}.${format}"`,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to export survey' },
      { status: 500 }
    )
  }
}
