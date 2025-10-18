import { NextRequest, NextResponse } from 'next/server'
import { getValidAccessToken } from '@/lib/calendar'

export async function GET(request: NextRequest) {
  try {
    // Get the current valid access token
    const accessToken = await getValidAccessToken('google')
    
    if (!accessToken) {
      return NextResponse.json({ 
        error: 'No calendar connected or token unavailable' 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      access_token: accessToken 
    })
  } catch (error) {
    console.error('Calendar token error:', error)
    return NextResponse.json({ 
      error: 'Failed to get calendar token' 
    }, { status: 500 })
  }
}

