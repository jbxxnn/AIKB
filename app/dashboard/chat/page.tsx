'use client'

import { useSession } from 'next-auth/react'
import { ChatKit, useChatKit } from '@openai/chatkit-react'
import { redirect } from 'next/navigation'
import { Loading03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState, useEffect, useRef } from 'react'

export default function ChatPage() {
  const { data: session, status } = useSession()
  const [isMounted, setIsMounted] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [chatKitState, setChatKitState] = useState<'loading' | 'ready' | 'error' | 'disappeared'>('loading')
  const chatKitRef = useRef<HTMLDivElement>(null)
  const renderCount = useRef(0)

  // Add debug logging
  const addDebugInfo = (message: string) => {
    const timestamp = new Date().toISOString()
    const debugMessage = `[${timestamp}] ${message}`
    console.log(debugMessage)
    setDebugInfo(prev => [...prev.slice(-9), debugMessage]) // Keep last 10 messages
  }

  // Track renders
  renderCount.current += 1
  addDebugInfo(`Render #${renderCount.current} - Status: ${status}, Mounted: ${isMounted}, ChatKitState: ${chatKitState}`)

  // Ensure component is mounted on client side
  useEffect(() => {
    addDebugInfo('useEffect: Setting isMounted to true')
    setIsMounted(true)
  }, [])

  // Track ChatKit state changes
  useEffect(() => {
    addDebugInfo(`ChatKit state changed to: ${chatKitState}`)
  }, [chatKitState])

  // Track session changes
  useEffect(() => {
    addDebugInfo(`Session changed - Status: ${status}, User: ${session?.user?.id}`)
  }, [session, status])

  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        addDebugInfo('getClientSecret called')
        setChatKitState('loading')

        if (existing) {
          addDebugInfo('Existing session detected')
          // For session refresh, we'll create a new session
          // In a production app, you might want to implement proper session refresh
        }

        try {
          const res = await fetch('/api/chatkit/session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          })

          addDebugInfo(`Session response status: ${res.status}`)

          if (!res.ok) {
            const errorText = await res.text()
            addDebugInfo(`Session creation failed: ${res.status} ${errorText}`)
            setChatKitState('error')
            throw new Error(`Failed to create chat session: ${res.status} ${errorText}`)
          }

          const data = await res.json()
          addDebugInfo('Session created successfully, setting state to ready')
          setChatKitState('ready')
          return data.client_secret
        } catch (error) {
          addDebugInfo(`Session creation error: ${error}`)
          setChatKitState('error')
          throw error
        }
      },
    },
  })

  // Monitor ChatKit component
  useEffect(() => {
    const checkChatKit = () => {
      if (chatKitRef.current) {
        const chatKitElement = chatKitRef.current.querySelector('openai-chatkit')
        if (chatKitElement) {
          addDebugInfo('ChatKit element found in DOM')
        } else {
          addDebugInfo('ChatKit element NOT found in DOM - component may have disappeared')
          setChatKitState('disappeared')
        }
      }
    }

    const interval = setInterval(checkChatKit, 1000)
    return () => clearInterval(interval)
  }, [])

  // Prevent hydration mismatch
  if (!isMounted) {
    addDebugInfo('Rendering: Not mounted yet')
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
    addDebugInfo('Rendering: Session loading')
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
    addDebugInfo('Rendering: No session, redirecting')
    redirect('/auth/signin')
    return null
  }

  if (chatKitState === 'error') {
    addDebugInfo('Rendering: ChatKit error state')
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">ChatKit Error</h3>
            <p className="text-red-600 mb-4">Failed to initialize ChatKit</p>
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

  if (chatKitState === 'disappeared') {
    addDebugInfo('Rendering: ChatKit disappeared state')
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">ChatKit Disappeared</h3>
            <p className="text-yellow-600 mb-4">The chat component disappeared unexpectedly</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
            >
              Reload
            </button>
          </div>
        </div>
      </div>
    )
  }

  addDebugInfo(`Rendering: ChatKit component - State: ${chatKitState}`)

  return (
    <div className="h-full flex flex-col">
      {/* Debug Panel */}
      <div className="bg-gray-100 p-2 text-xs max-h-32 overflow-y-auto">
        <div className="font-semibold mb-1">Debug Info:</div>
        {debugInfo.map((info, index) => (
          <div key={index} className="text-gray-600">{info}</div>
        ))}
      </div>
      
      <div className="flex-1 min-h-0" ref={chatKitRef}>
        <ChatKit 
          control={control} 
          className="h-full w-full rounded-sm"
        />
      </div>
    </div>
  )
}
