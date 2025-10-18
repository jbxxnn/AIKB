import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { fileId, vectorStoreId, attributes, chunkingStrategy } = await request.json()

    if (!fileId || !vectorStoreId) {
      return NextResponse.json(
        { error: 'fileId and vectorStoreId are required' },
        { status: 400 }
      )
    }

    // Get the original file details to store filename
    let filename = 'Unknown file'
    try {
      const fileDetails = await openai.files.retrieve(fileId)
      filename = fileDetails.filename || 'Unknown file'
    } catch (error) {
      console.log('Could not retrieve file details for', fileId)
    }

    // Add file to vector store with filename in attributes
    const vectorStoreFile = await openai.vectorStores.files.create(
      vectorStoreId,
      {
        file_id: fileId,
        attributes: {
          ...attributes,
          filename: filename
        },
        chunking_strategy: chunkingStrategy || undefined
      }
    )

    return NextResponse.json({
      id: vectorStoreFile.id,
      object: vectorStoreFile.object,
      created_at: vectorStoreFile.created_at,
      usage_bytes: vectorStoreFile.usage_bytes,
      vector_store_id: vectorStoreFile.vector_store_id,
      status: vectorStoreFile.status,
      last_error: vectorStoreFile.last_error,
      chunking_strategy: vectorStoreFile.chunking_strategy
    })

  } catch (error) {
    console.error('Vector store add file error:', error)
    return NextResponse.json(
      { error: 'Failed to add file to vector store' },
      { status: 500 }
    )
  }
}
