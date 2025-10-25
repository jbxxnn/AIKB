import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    console.log('Creating new ChatKit thread...')
    
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate a unique thread ID
    const threadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    console.log('Thread created:', threadId)
    
    return NextResponse.json({ 
      thread_id: threadId,
      created_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error creating thread:', error)
    return NextResponse.json(
      { error: `Failed to create thread: ${error instanceof Error ? error.message : 'Unknown error'}` }, 
      { status: 500 }
    )
  }
}

