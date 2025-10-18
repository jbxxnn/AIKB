import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { executeCalendarFunction } from '@/lib/calendar-functions'

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { function_name, arguments: args } = await request.json()

    // Execute the calendar function
    const result = await executeCalendarFunction(function_name, args)

    return NextResponse.json({ result })
  } catch (error) {
    console.error('AI Calendar function error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
