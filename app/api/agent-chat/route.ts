import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { runWorkflow } from '@/lib/agent'

export async function POST(request: NextRequest) {
  try {
    console.log('Agent chat request received')
    
    // Get the current session
    const session = await getServerSession(authOptions)
    console.log('Session:', session ? { id: session.user?.id, role: session.user?.role } : 'No session')
    
    if (!session) {
      console.log('No session found, returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse the request body
    const body = await request.json()
    const { message } = body

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    console.log('Processing message:', message)

    // Run the agent workflow
    const result = await runWorkflow({
      input_as_text: message
    })

    console.log('Agent result:', result)

    return NextResponse.json({
      success: true,
      response: result.output_text
    })

  } catch (error) {
    console.error('Agent chat error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}
