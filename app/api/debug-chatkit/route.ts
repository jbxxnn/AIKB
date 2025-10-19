import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('Debug ChatKit endpoint called')
    
    // Check environment variables
    const envCheck = {
      OPENAI_API_SECRET_KEY: !!process.env.OPENAI_API_SECRET_KEY,
      OPENAI_ADMIN_WORKFLOW_ID: !!process.env.OPENAI_ADMIN_WORKFLOW_ID,
      OPENAI_USER_WORKFLOW_ID: !!process.env.OPENAI_USER_WORKFLOW_ID,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NODE_ENV: process.env.NODE_ENV,
    }
    
    console.log('Environment check:', envCheck)
    
    // Check session
    const session = await getServerSession(authOptions)
    console.log('Session check:', session ? { 
      id: session.user?.id, 
      role: session.user?.role,
      email: session.user?.email 
    } : 'No session')
    
    // Test OpenAI API connectivity
    let openaiTest = null
    if (process.env.OPENAI_API_SECRET_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_SECRET_KEY}`,
          },
        })
        openaiTest = {
          status: response.status,
          ok: response.ok,
        }
      } catch (error) {
        openaiTest = { error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envCheck,
      session: session ? { 
        id: session.user?.id, 
        role: session.user?.role,
        email: session.user?.email 
      } : null,
      openaiTest,
      userAgent: request.headers.get('user-agent'),
    })
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}
