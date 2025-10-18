import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCalendarStatus, disconnectCalendar } from '@/lib/calendar'

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const status = await getCalendarStatus('google')
    
    if (!status) {
      return NextResponse.json({ 
        connected: false,
        message: 'No calendar connected'
      })
    }

    return NextResponse.json({
      connected: true,
      connectedBy: {
        name: status.connected_by_name,
        email: status.connected_by_email
      },
      connectedAt: status.created_at,
      lastUpdated: status.updated_at,
      expiresAt: status.expires_at,
      calendarId: status.calendar_id
    })
  } catch (error) {
    console.error('Calendar status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const success = await disconnectCalendar('google')
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to disconnect calendar' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Calendar disconnected successfully'
    })
  } catch (error) {
    console.error('Calendar disconnect error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
