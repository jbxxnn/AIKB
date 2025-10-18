import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const purpose = formData.get('purpose') as string || 'assistants'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Convert File to OpenAI format
    const buffer = await file.arrayBuffer()
    const fileBlob = new File([buffer], file.name, { type: file.type })

    // Upload file to OpenAI
    const openaiFile = await openai.files.create({
      file: fileBlob,
      purpose: purpose as 'assistants' | 'batch' | 'fine-tune' | 'vision'
    })

    return NextResponse.json({
      id: openaiFile.id,
      object: openaiFile.object,
      bytes: openaiFile.bytes,
      created_at: openaiFile.created_at,
      filename: openaiFile.filename,
      purpose: openaiFile.purpose,
      status: openaiFile.status
    })

  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
