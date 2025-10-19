'use client'

import { useSession } from 'next-auth/react'
import { ChatKit, useChatKit } from '@openai/chatkit-react'
import { redirect } from 'next/navigation'
import { Loading03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState, useEffect, useMemo, useCallback } from 'react'

export default function ChatPage() {
  const { data: session, status } = useSession()
  const [isMounted, setIsMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chatKitReady, setChatKitReady] = useState(false)

  // Ensure component is mounted on client side
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Memoize the getClientSecret function to prevent recreating on every render
  const getClientSecret = useCallback(async (existing: any) => {
    try {
      console.log('ChatKit: Requesting client secret...', { existing: !!existing })
      
      const res = await fetch('/api/chatkit/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('ChatKit: API response status:', res.status)

      if (!res.ok) {
        const errorText = await res.text()
        const errorMessage = `Failed to create chat session: ${res.status} ${errorText}`
        console.error('ChatKit: Session creation failed:', errorMessage)
        setError(errorMessage)
        throw new Error(errorMessage)
      }

      const data = await res.json()
      console.log('ChatKit: Session created successfully')
      setError(null) // Clear any previous errors
      return data.client_secret
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('ChatKit: Session creation error:', errorMessage)
      setError(errorMessage)
      throw error
    }
  }, [])

  // Memoize the useChatKit configuration
  const chatKitConfig = useMemo(() => ({
    api: {
      getClientSecret,
    },
  }), [getClientSecret])

  const { control } = useChatKit(chatKitConfig)

  // Add error handling for ChatKit initialization
  useEffect(() => {
    const handleChatKitError = (event: any) => {
      console.error('ChatKit error:', event.detail)
      setError(`ChatKit Error: ${event.detail?.error?.message || 'Unknown error'}`)
    }

    const handleChatKitReady = () => {
      console.log('ChatKit is ready')
      setChatKitReady(true)
    }

    // Listen for ChatKit events
    window.addEventListener('chatkit.error', handleChatKitError)
    window.addEventListener('chatkit.response.start', handleChatKitReady)

    // Set a timeout to show ChatKit even if events don't fire
    const timeout = setTimeout(() => {
      console.log('ChatKit timeout - showing component anyway')
      setChatKitReady(true)
    }, 5000) // 5 second timeout

    return () => {
      window.removeEventListener('chatkit.error', handleChatKitError)
      window.removeEventListener('chatkit.response.start', handleChatKitReady)
      clearTimeout(timeout)
    }
  }, [])

  // Prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <HugeiconsIcon icon={Loading03Icon} className="h-10 w-10 animate-spin"/>
          <p className="mt-2">Loading...</p>
          <p className="text-xs text-gray-500 mt-1">Initializing...</p>
        </div>
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <HugeiconsIcon icon={Loading03Icon} className="h-10 w-10 animate-spin"/>
          <p className="mt-2">Loading...</p>
          <p className="text-xs text-gray-500 mt-1">Checking session...</p>
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
            <h3 className="text-lg font-semibold text-red-800 mb-2">ChatKit Error</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => {
                setError(null)
                window.location.reload()
              }} 
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
        {!chatKitReady && !error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <HugeiconsIcon icon={Loading03Icon} className="h-10 w-10 animate-spin"/>
              <p className="mt-2">Initializing ChatKit...</p>
              <p className="text-xs text-gray-500 mt-1">Setting up chat interface</p>
            </div>
          </div>
        ) : (
          <ChatKit 
            control={control} 
            className="h-full w-full rounded-sm"
          />
        )}
      </div>
    </div>
  )
}
