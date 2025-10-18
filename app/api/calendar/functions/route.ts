import { NextRequest, NextResponse } from 'next/server'
import { getValidAccessToken } from '@/lib/calendar'

// Google Calendar API functions
async function searchEvents(accessToken: string, timeMin?: string, timeMax?: string, query?: string) {
  const params = new URLSearchParams()
  if (timeMin) params.set('timeMin', timeMin)
  if (timeMax) params.set('timeMax', timeMax)
  if (query) params.set('q', query)
  params.set('singleEvents', 'true')
  params.set('orderBy', 'startTime')

  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Google Calendar API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

async function createEvent(accessToken: string, eventData: any) {
  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventData),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Google Calendar API error: ${response.status} ${error}`)
  }

  return response.json()
}

async function updateEvent(accessToken: string, eventId: string, eventData: any) {
  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventData),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Google Calendar API error: ${response.status} ${error}`)
  }

  return response.json()
}

async function deleteEvent(accessToken: string, eventId: string) {
  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Google Calendar API error: ${response.status} ${error}`)
  }

  return { success: true }
}

export async function POST(request: NextRequest) {
  try {
    const { function_name, arguments: args } = await request.json()

    // Get valid access token
    const accessToken = await getValidAccessToken('google')
    if (!accessToken) {
      return NextResponse.json({ 
        error: 'No calendar connected or token unavailable' 
      }, { status: 404 })
    }

    let result

    switch (function_name) {
      case 'search_events':
        result = await searchEvents(accessToken, args.timeMin, args.timeMax, args.query)
        break

      case 'create_event':
        result = await createEvent(accessToken, args.eventData)
        break

      case 'update_event':
        result = await updateEvent(accessToken, args.eventId, args.eventData)
        break

      case 'delete_event':
        result = await deleteEvent(accessToken, args.eventId)
        break

      default:
        return NextResponse.json({ 
          error: `Unknown function: ${function_name}` 
        }, { status: 400 })
    }

    return NextResponse.json({ result })
  } catch (error) {
    console.error('Calendar function error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
