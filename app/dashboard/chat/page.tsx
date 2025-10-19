'use client'

import { useSession } from 'next-auth/react'
import { ChatKit, useChatKit } from '@openai/chatkit-react'
import { redirect } from 'next/navigation'
import { Loading03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState, useEffect } from 'react'

export default function ChatPage() {
  const { data: session, status } = useSession()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        try {
          console.log('Creating ChatKit session...')
          setIsLoading(true)
          setError(null)

          if (existing) {
            // For session refresh, we'll create a new session
            // In a production app, you might want to implement proper session refresh
          }

          const res = await fetch('/api/chatkit/session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          })

          console.log('Session response status:', res.status)

          if (!res.ok) {
            const errorText = await res.text()
            console.error('Session creation failed:', errorText)
            throw new Error(`Failed to create chat session: ${res.status} ${errorText}`)
          }

          const data = await res.json()
          console.log('Session created successfully')
          setIsLoading(false)
          return data.client_secret
        } catch (err) {
          console.error('ChatKit session error:', err)
          setError(err instanceof Error ? err.message : 'Unknown error')
          setIsLoading(false)
          throw err
        }
      },
    },
  })

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <HugeiconsIcon icon={Loading03Icon} className="h-10 w-10 animate-spin"/>
          <p className="mt-2">Loading chat...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    redirect('/auth/signin')
    return null
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Chat Error</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <ChatKit 
          control={control} 
          className="h-full w-full rounded-sm"
        />
      </div>
    </div>
  )
}
