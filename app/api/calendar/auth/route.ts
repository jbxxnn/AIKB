import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate OAuth URL
    const clientId = process.env.GOOGLE_CLIENT_ID
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/calendar/callback`
    
    if (!clientId) {
      return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 500 })
    }

    const scope = 'https://www.googleapis.com/auth/calendar.events'
    const state = session.user.id // Use user ID as state for security
    
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', scope)
    authUrl.searchParams.set('state', state)
    authUrl.searchParams.set('access_type', 'offline')
    authUrl.searchParams.set('prompt', 'consent')

    return NextResponse.redirect(authUrl.toString())
  } catch (error) {
    console.error('Calendar auth error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
