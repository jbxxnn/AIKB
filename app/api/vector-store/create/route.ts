import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { name, expires_after } = await request.json()

    // Create vector store
    const vectorStore = await openai.vectorStores.create({
      name: name || 'AI Knowledge Base',
      expires_after: expires_after || null
    })

    return NextResponse.json({
      id: vectorStore.id,
      object: vectorStore.object,
      created_at: vectorStore.created_at,
      name: vectorStore.name,
      bytes: vectorStore.bytes,
      file_counts: vectorStore.file_counts,
      status: vectorStore.status,
      expires_after: vectorStore.expires_after,
      usage_bytes: vectorStore.usage_bytes
    })

  } catch (error) {
    console.error('Vector store creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create vector store' },
      { status: 500 }
    )
  }
}




