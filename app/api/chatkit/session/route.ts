import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    console.log('ChatKit session request received')
    
    // Get the current session to determine user role
    const session = await getServerSession(authOptions)
    console.log('Session:', session ? { id: session.user?.id, role: session.user?.role } : 'No session')
    
    if (!session) {
      console.log('No session found, returning 401')
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
    console.log('Workflow ID:', workflowId)
    
    if (!workflowId) {
      console.log('No workflow ID found for role:', session.user?.role)
      return NextResponse.json(
        { error: 'No workflow ID found for user role' }, 
        { status: 500 }
      )
    }

    // Create ChatKit session
    console.log('Creating ChatKit session with OpenAI API...')
    const response = await fetch('https://api.openai.com/v1/chatkit/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'chatkit_beta=v1',
        'Authorization': `Bearer ${process.env.OPENAI_API_SECRET_KEY}`,
      },
      body: JSON.stringify({
        workflow: { id: workflowId },
        user: session.user.id,
      }),
    })

    console.log('OpenAI API response status:', response.status)

    if (!response.ok) {
      const error = await response.text()
      console.error('ChatKit session creation failed:', error)
      return NextResponse.json(
        { error: `Failed to create chat session: ${response.status} ${error}` }, 
        { status: 500 }
      )
    }

    const data = await response.json()
    console.log('ChatKit session created successfully')
    
    return NextResponse.json({ client_secret: data.client_secret })
  } catch (error) {
    console.error('ChatKit session error:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` }, 
      { status: 500 }
    )
  }
}


