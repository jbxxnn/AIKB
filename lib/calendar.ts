import { sql } from './db'

export interface CalendarSettings {
  id: number
  provider: string
  access_token: string
  refresh_token: string | null
  expires_at: Date | null
  calendar_id: string | null
  connected_by_user_id: number
  created_at: Date
  updated_at: Date
  is_active: boolean
}

export interface GoogleTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
  scope: string
}

/**
 * Get the active calendar settings for the specified provider
 */
export async function getActiveCalendarSettings(provider: string = 'google'): Promise<CalendarSettings | null> {
  try {
    const settings = await sql`
      SELECT * FROM calendar_settings 
      WHERE provider = ${provider} AND is_active = true 
      ORDER BY created_at DESC 
      LIMIT 1
    `
    return settings[0] as CalendarSettings | null
  } catch (error) {
    console.error('Error fetching calendar settings:', error)
    return null
  }
}

/**
 * Get a valid access token, refreshing if necessary
 */
export async function getValidAccessToken(provider: string = 'google'): Promise<string | null> {
  const settings = await getActiveCalendarSettings(provider)
  
  if (!settings) {
    return null
  }

  // Check if token is expired (with 5 minute buffer)
  const now = new Date()
  const expiresAt = settings.expires_at ? new Date(settings.expires_at) : null
  
  if (expiresAt && now >= expiresAt) {
    // Token is expired, try to refresh
    if (settings.refresh_token) {
      const refreshed = await refreshGoogleToken(settings.refresh_token)
      if (refreshed) {
        return refreshed.access_token
      }
    }
    return null
  }

  return settings.access_token
}

/**
 * Refresh a Google OAuth token
 */
export async function refreshGoogleToken(refreshToken: string): Promise<GoogleTokenResponse | null> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) {
      console.error('Token refresh failed:', await response.text())
      return null
    }

    const tokenData: GoogleTokenResponse = await response.json()
    
    // Update the database with new tokens
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000)
    
    await sql`
      UPDATE calendar_settings 
      SET 
        access_token = ${tokenData.access_token},
        refresh_token = ${tokenData.refresh_token || null},
        expires_at = ${expiresAt},
        updated_at = CURRENT_TIMESTAMP
      WHERE refresh_token = ${refreshToken} AND is_active = true
    `

    return tokenData
  } catch (error) {
    console.error('Error refreshing Google token:', error)
    return null
  }
}

/**
 * Store new calendar settings (deactivate old ones first)
 */
export async function storeCalendarSettings(
  accessToken: string,
  refreshToken: string | null,
  expiresAt: Date | null,
  calendarId: string | null,
  userId: number,
  provider: string = 'google'
): Promise<boolean> {
  try {
    // Deactivate any existing active settings for this provider
    await sql`
      UPDATE calendar_settings 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE provider = ${provider} AND is_active = true
    `

    // Insert new settings
    await sql`
      INSERT INTO calendar_settings (
        provider, access_token, refresh_token, expires_at, 
        calendar_id, connected_by_user_id, is_active
      ) VALUES (
        ${provider}, ${accessToken}, ${refreshToken}, ${expiresAt},
        ${calendarId}, ${userId}, true
      )
    `

    return true
  } catch (error) {
    console.error('Error storing calendar settings:', error)
    return false
  }
}

/**
 * Disconnect calendar (deactivate settings)
 */
export async function disconnectCalendar(provider: string = 'google'): Promise<boolean> {
  try {
    await sql`
      UPDATE calendar_settings 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE provider = ${provider} AND is_active = true
    `
    return true
  } catch (error) {
    console.error('Error disconnecting calendar:', error)
    return false
  }
}

/**
 * Get calendar connection status with user info
 */
export async function getCalendarStatus(provider: string = 'google') {
  try {
    const result = await sql`
      SELECT 
        cs.*,
        u.name as connected_by_name,
        u.email as connected_by_email
      FROM calendar_settings cs
      JOIN users u ON cs.connected_by_user_id = u.id
      WHERE cs.provider = ${provider} AND cs.is_active = true
      ORDER BY cs.created_at DESC
      LIMIT 1
    `
    
    return result[0] || null
  } catch (error) {
    console.error('Error fetching calendar status:', error)
    return null
  }
}
