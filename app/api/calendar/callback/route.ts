import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { storeCalendarSettings } from '@/lib/calendar'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      console.error('OAuth error:', error)
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/schedule?error=oauth_denied`)
    }

    if (!code || !state) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/schedule?error=invalid_request`)
    }

    // Verify the user is still an admin and matches the state
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'admin' || session.user.id !== state) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/schedule?error=unauthorized`)
    }

    // Exchange code for tokens
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/calendar/callback`

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/schedule?error=config_error`)
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token exchange failed:', errorText)
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/schedule?error=token_exchange_failed`)
    }

    const tokenData = await tokenResponse.json()
    
    // Calculate expiration time
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000)
    
    // Store tokens in database
    const success = await storeCalendarSettings(
      tokenData.access_token,
      tokenData.refresh_token,
      expiresAt,
      null, // calendar_id - we'll get this later if needed
      parseInt(session.user.id),
      'google'
    )

    if (!success) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/schedule?error=storage_failed`)
    }

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/schedule?success=connected`)
  } catch (error) {
    console.error('Calendar callback error:', error)
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/schedule?error=internal_error`)
  }
}
