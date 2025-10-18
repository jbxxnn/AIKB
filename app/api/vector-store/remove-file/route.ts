import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function DELETE(request: NextRequest) {
  try {
    const { fileId, vectorStoreId } = await request.json()

    if (!fileId || !vectorStoreId) {
      return NextResponse.json(
        { error: 'fileId and vectorStoreId are required' },
        { status: 400 }
      )
    }

    // Remove file from vector store
    const result = await openai.vectorStores.files.delete(
      fileId,
      { vector_store_id: vectorStoreId }
    )

    return NextResponse.json({
      id: result.id,
      object: result.object,
      deleted: result.deleted
    })

  } catch (error) {
    console.error('Vector store remove file error:', error)
    return NextResponse.json(
      { error: 'Failed to remove file from vector store' },
      { status: 500 }
    )
  }
}
