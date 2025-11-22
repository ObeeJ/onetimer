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

    // Mock successful verification (replace with real Prembly call later)
    const verificationData = {
      nin: nin,
      firstname: 'John',
      lastname: 'Doe', 
      phone: '08012345678',
      birthdate: '1990-01-01',
      gender: 'Male'
    }

    // Update user KYC status in backend
    try {
      const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          kycStatus: 'approved'
        })
      })

      if (!updateResponse.ok) {
        console.error('Failed to update user KYC status:', await updateResponse.text())
      }
    } catch (updateError) {
      console.error('Error updating KYC status:', updateError)
    }

    return NextResponse.json({
      status: 'success',
      message: 'KYC verification successful',
      data: {
        ...verificationData,
        verified: true
      }
    }, { status: 200 })

  } catch (error) {
    console.error('KYC verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}