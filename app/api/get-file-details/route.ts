import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')

    if (!fileId) {
      return NextResponse.json(
        { error: 'fileId is required' },
        { status: 400 }
      )
    }

    // Get file details from OpenAI
    const file = await openai.files.retrieve(fileId)

    return NextResponse.json({
      id: file.id,
      object: file.object,
      bytes: file.bytes,
      created_at: file.created_at,
      filename: file.filename,
      purpose: file.purpose,
      status: file.status
    })

  } catch (error) {
    console.error('Get file details error:', error)
    return NextResponse.json(
      { error: 'Failed to get file details' },
      { status: 500 }
    )
  }
}




