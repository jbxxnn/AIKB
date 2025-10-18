import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getValidAccessToken } from '@/lib/calendar'

export async function POST(request: NextRequest) {
  try {
    // Get the current session to determine user role
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Determine workflow ID based on user role
    const getWorkflowId = () => {
      if (session.user?.role === 'admin') {
        return process.env.OPENAI_ADMIN_WORKFLOW_ID
      } else {
        return process.env.OPENAI_USER_WORKFLOW_ID
      }
    }

    const workflowId = getWorkflowId()
    
    if (!workflowId) {
      return NextResponse.json(
        { error: 'No workflow ID found for user role' }, 
        { status: 500 }
      )
    }

    // Check if Google Calendar is connected and get valid token
    const calendarToken = await getValidAccessToken('google')
    
    // Build tools array for ChatKit session
    const tools = []
    if (calendarToken) {
      tools.push({
        type: "mcp",
        server_label: "google_calendar",
        connector_id: "connector_googlecalendar",
        authorization: calendarToken,
        require_approval: "never"
      })
    }

    // Create ChatKit session
    const sessionBody: any = {
      workflow: { id: workflowId },
      user: session.user.id,
    }

    // Add tools if any are available
    if (tools.length > 0) {
      sessionBody.tools = tools
    }

    const response = await fetch('https://api.openai.com/v1/chatkit/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'chatkit_beta=v1',
        'Authorization': `Bearer ${process.env.OPENAI_API_SECRET_KEY}`,
      },
      body: JSON.stringify(sessionBody),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('ChatKit session creation failed:', error)
      return NextResponse.json(
        { error: 'Failed to create chat session' }, 
        { status: 500 }
      )
    }

    const { client_secret } = await response.json()
    
    return NextResponse.json({ client_secret })
  } catch (error) {
    console.error('ChatKit session error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}


