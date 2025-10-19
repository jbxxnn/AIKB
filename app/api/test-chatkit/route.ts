import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing ChatKit API directly...')
    
    const workflowId = process.env.OPENAI_ADMIN_WORKFLOW_ID
    const apiKey = process.env.OPENAI_API_SECRET_KEY
    
    if (!workflowId || !apiKey) {
      return NextResponse.json({ 
        error: 'Missing environment variables',
        workflowId: !!workflowId,
        apiKey: !!apiKey
      }, { status: 500 })
    }

    console.log('Making request to OpenAI ChatKit API...')
    console.log('Workflow ID:', workflowId)
    
    const response = await fetch('https://api.openai.com/v1/chatkit/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'chatkit_beta=v1',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        workflow: { id: workflowId },
        user: 'test-user-123',
      }),
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

    const responseText = await response.text()
    console.log('Response body:', responseText)

    if (!response.ok) {
      return NextResponse.json({
        error: 'ChatKit API call failed',
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText
      }, { status: 500 })
    }

    const data = JSON.parse(responseText)
    return NextResponse.json({
      success: true,
      status: response.status,
      data: {
        hasClientSecret: !!data.client_secret,
        keys: Object.keys(data)
      }
    })
  } catch (error) {
    console.error('ChatKit test error:', error)
    return NextResponse.json({ 
      error: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}
