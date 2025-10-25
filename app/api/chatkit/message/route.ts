import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const CHATKIT_SERVER_URL = process.env.CHATKIT_SERVER_URL || 'http://localhost:8000'
const USE_DIRECT_OPENAI = process.env.USE_DIRECT_OPENAI === 'true' || !process.env.CHATKIT_SERVER_URL

export async function POST(request: NextRequest) {
  try {
    console.log('Sending message to ChatKit server...')
    
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { thread_id, message, user_id } = await request.json()
    
    if (!thread_id || !message) {
      return NextResponse.json(
        { error: 'Missing thread_id or message' }, 
        { status: 400 }
      )
    }

    if (USE_DIRECT_OPENAI) {
      // Use direct OpenAI API instead of ChatKit server
      console.log('Using direct OpenAI API...')
      
      const { OpenAI } = await import('openai')
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_SECRET_KEY,
      })

      // Use your Agent Builder workflow instead of direct OpenAI
      const workflowId = session.user?.role === 'admin' 
        ? process.env.OPENAI_ADMIN_WORKFLOW_ID 
        : process.env.OPENAI_USER_WORKFLOW_ID

      if (!workflowId) {
        throw new Error('No workflow ID found for user role')
      }

      console.log('Using Agent Builder workflow:', workflowId)

      // Create ChatKit session for Agent Builder
      const sessionResponse = await fetch('https://api.openai.com/v1/chatkit/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'chatkit_beta=v1',
          'Authorization': `Bearer ${process.env.OPENAI_API_SECRET_KEY}`,
        },
        body: JSON.stringify({
          workflow: { id: workflowId },
          user: session.user?.id || 'anonymous',
        }),
      })

      if (!sessionResponse.ok) {
        const errorText = await sessionResponse.text()
        throw new Error(`Failed to create ChatKit session: ${sessionResponse.status} ${errorText}`)
      }

      const sessionData = await sessionResponse.json()
      const clientSecret = sessionData.client_secret

      // Use ChatKit API with your workflow
      const chatkitResponse = await fetch('https://api.openai.com/v1/chatkit/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'chatkit_beta=v1',
          'Authorization': `Bearer ${process.env.OPENAI_API_SECRET_KEY}`,
        },
        body: JSON.stringify({
          client_secret: clientSecret,
          message: {
            role: 'user',
            content: message
          }
        }),
      })

      if (!chatkitResponse.ok) {
        const errorText = await chatkitResponse.text()
        throw new Error(`Failed to send message to ChatKit: ${chatkitResponse.status} ${errorText}`)
      }

      // Stream the response from your Agent Builder workflow
      const stream = chatkitResponse.body

      // Create a readable stream for ChatKit response
      const encoder = new TextEncoder()
      
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            const reader = stream?.getReader()
            const decoder = new TextDecoder()
            
            while (true) {
              const { done, value } = await reader?.read() || { done: true, value: null }
              if (done) break
              
              const chunk = decoder.decode(value)
              const lines = chunk.split('\n')
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6))
                    
                    // Handle different ChatKit event types
                    if (data.type === 'assistant_message' && data.content) {
                      const content = data.content
                      const responseData = `data: ${JSON.stringify({ type: 'assistant_message', content })}\n\n`
                      controller.enqueue(encoder.encode(responseData))
                    } else if (data.type === 'tool_call') {
                      // Handle tool calls from your Agent Builder
                      console.log('Tool call detected:', data)
                      const toolData = `data: ${JSON.stringify({ type: 'tool_call', data })}\n\n`
                      controller.enqueue(encoder.encode(toolData))
                    } else if (data.type === 'widget') {
                      // Handle widgets from your Agent Builder
                      console.log('Widget detected:', data)
                      const widgetData = `data: ${JSON.stringify({ type: 'widget', data })}\n\n`
                      controller.enqueue(encoder.encode(widgetData))
                    }
                  } catch (e) {
                    console.error('Error parsing ChatKit data:', e)
                  }
                }
              }
            }
            
            // Send completion signal
            const completion = `data: ${JSON.stringify({ type: 'complete', content: '' })}\n\n`
            controller.enqueue(encoder.encode(completion))
            controller.close()
          } catch (error) {
            console.error('Streaming error:', error)
            const errorData = `data: ${JSON.stringify({ type: 'error', content: `Error: ${error}` })}\n\n`
            controller.enqueue(encoder.encode(errorData))
            controller.close()
          }
        }
      })

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        }
      })
    } else {
      // Use ChatKit server
      console.log('Forwarding to ChatKit server:', { thread_id, message: message.substring(0, 50) + '...' })

      const response = await fetch(`${CHATKIT_SERVER_URL}/chatkit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user_id || session.user?.id || 'anonymous',
        },
        body: JSON.stringify({
          thread_id,
          message,
          user_id: user_id || session.user?.id || 'anonymous'
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('ChatKit server error:', response.status, errorText)
        return NextResponse.json(
          { error: `ChatKit server error: ${response.status} ${errorText}` }, 
          { status: response.status }
        )
      }

      // Return the streaming response
      return new Response(response.body, {
        status: response.status,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        }
      })
    }

  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: `Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}` }, 
      { status: 500 }
    )
  }
}
