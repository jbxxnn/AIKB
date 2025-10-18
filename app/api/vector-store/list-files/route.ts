import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vectorStoreId = searchParams.get('vectorStoreId')
    const limit = searchParams.get('limit') || '20'
    const order = searchParams.get('order') || 'desc'
    const filter = searchParams.get('filter')

    if (!vectorStoreId) {
      return NextResponse.json(
        { error: 'vectorStoreId is required' },
        { status: 400 }
      )
    }

    // List files in vector store
    const vectorStoreFiles = await openai.vectorStores.files.list(
      vectorStoreId,
      {
        limit: parseInt(limit),
        order: order as 'asc' | 'desc',
        ...(filter && ['in_progress', 'completed', 'failed', 'cancelled'].includes(filter) && { filter: filter as 'in_progress' | 'completed' | 'failed' | 'cancelled' })
      }
    )

    return NextResponse.json({
      object: vectorStoreFiles.object,
      data: vectorStoreFiles.data,
      first_id: vectorStoreFiles.first_id,
      last_id: vectorStoreFiles.last_id,
      has_more: vectorStoreFiles.has_more
    })

  } catch (error) {
    console.error('Vector store list files error:', error)
    return NextResponse.json(
      { error: 'Failed to list vector store files' },
      { status: 500 }
    )
  }
}
