import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('Test session endpoint called')
    
    // Get the current session to determine user role
    const session = await getServerSession(authOptions)
    console.log('Session:', session ? { id: session.user?.id, role: session.user?.role } : 'No session')
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check environment variables
    const envCheck = {
      OPENAI_API_SECRET_KEY: !!process.env.OPENAI_API_SECRET_KEY,
      OPENAI_ADMIN_WORKFLOW_ID: !!process.env.OPENAI_ADMIN_WORKFLOW_ID,
      OPENAI_USER_WORKFLOW_ID: !!process.env.OPENAI_USER_WORKFLOW_ID,
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
    
    return NextResponse.json({ 
      success: true,
      session: { id: session.user?.id, role: session.user?.role },
      workflowId,
      envCheck,
      message: 'Session test successful'
    })
  } catch (error) {
    console.error('Test session error:', error)
    return NextResponse.json({ 
      error: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}
