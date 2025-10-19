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
  const [debugMode, setDebugMode] = useState(false)

  // Ensure component is mounted on client side
  useEffect(() => {
    setIsMounted(true)
    
    // Check if ChatKit script is loaded
    const checkChatKitScript = () => {
      const script = document.querySelector('script[src*="chatkit.js"]') as HTMLScriptElement | null
      if (script) {
        console.log('ChatKit script found:', script.getAttribute('src'))
        script.addEventListener('load', () => {
          console.log('ChatKit script loaded')
        })
        script.addEventListener('error', (e) => {
          console.error('ChatKit script failed to load:', e)
          setError('Failed to load ChatKit script')
        })
      } else {
        console.error('ChatKit script not found in DOM')
        setError('ChatKit script not found')
      }
    }
    
    // Check after a short delay to ensure DOM is ready
    setTimeout(checkChatKitScript, 100)
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

    const handleChatKitLoaded = () => {
      console.log('ChatKit loaded')
      setChatKitReady(true)
    }

    // Listen for ChatKit events
    window.addEventListener('chatkit.error', handleChatKitError)
    window.addEventListener('chatkit.response.start', handleChatKitReady)
    window.addEventListener('chatkit.response.end', handleChatKitLoaded)

    // Also check for the web component to be loaded
    const checkChatKitElement = () => {
      const chatKitElement = document.querySelector('openai-chatkit')
      if (chatKitElement) {
        console.log('ChatKit element found:', chatKitElement)
        console.log('ChatKit element attributes:', chatKitElement.attributes)
        
        // Check if the element has loaded
        if (chatKitElement.getAttribute('data-loaded') === 'true') {
          console.log('ChatKit element is loaded')
          setChatKitReady(true)
        } else {
          console.log('ChatKit element not loaded yet, checking again...')
          console.log('Current attributes:', Array.from(chatKitElement.attributes).map(attr => `${attr.name}="${attr.value}"`))
          
          // Check if there's an iframe inside
          const iframe = chatKitElement.querySelector('iframe')
          if (iframe) {
            console.log('Iframe found:', iframe.src)
            console.log('Iframe loaded:', iframe.contentWindow?.document.readyState === 'complete')
          } else {
            console.log('No iframe found yet')
          }
          
          // Check again in 1 second
          setTimeout(checkChatKitElement, 1000)
        }
      } else {
        console.log('ChatKit element not found yet, checking again...')
        // Check again in 500ms
        setTimeout(checkChatKitElement, 500)
      }
    }

    // Start checking for the element
    checkChatKitElement()

    // Set a timeout to show ChatKit even if events don't fire
    const timeout = setTimeout(() => {
      console.log('ChatKit timeout - showing component anyway')
      setChatKitReady(true)
    }, 3000) // 3 second timeout - more aggressive
    
    // Also try to force show after 1 second if we have a session
    const forceShowTimeout = setTimeout(() => {
      if (session && !chatKitReady) {
        console.log('Force showing ChatKit after 1 second')
        setChatKitReady(true)
      }
    }, 1000)

    return () => {
      window.removeEventListener('chatkit.error', handleChatKitError)
      window.removeEventListener('chatkit.response.start', handleChatKitReady)
      window.removeEventListener('chatkit.response.end', handleChatKitLoaded)
      clearTimeout(timeout)
      clearTimeout(forceShowTimeout)
    }
  }, [session])

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
              <button 
                onClick={() => {
                  console.log('Force showing ChatKit manually')
                  setChatKitReady(true)
                }}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                Force Show ChatKit
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full w-full">
            <ChatKit 
              control={control} 
              className="h-full w-full rounded-sm"
              style={{ minHeight: '400px' }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
