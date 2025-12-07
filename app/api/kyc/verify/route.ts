import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nin } = body
    
    if (!nin || nin.length !== 11) {
      return NextResponse.json(
        { error: 'Invalid NIN. Must be 11 digits.' },
        { status: 400 }
      )
    }

    // Get auth token from cookies
    const cookieStore = cookies()
    const token = cookieStore.get('auth_token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Call backend to verify NIN
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8081';
    const response = await fetch(`${backendUrl}/api/user/kyc/verify-nin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ nin })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || 'KYC verification failed' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      status: 'success',
      message: 'KYC verification successful',
      data: data
    }, { status: 200 })

  } catch (error) {
    console.error('KYC verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}