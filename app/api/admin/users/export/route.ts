import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/admin/export/users`, {
      method: 'GET',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Cookie': request.headers.get('Cookie') || '',
      },
    })

    if (response.ok) {
      const data = await response.blob()
      return new NextResponse(data, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="users.csv"'
        }
      })
    }

    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to export users' }, { status: 500 })
  }
}