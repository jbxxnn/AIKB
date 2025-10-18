'use client'

import { useSession } from 'next-auth/react'
import { ChatKit, useChatKit } from '@openai/chatkit-react'
import { redirect } from 'next/navigation'
import { Loading03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

export default function ChatPage() {
  const { data: session, status } = useSession()

  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
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

        if (!res.ok) {
          throw new Error('Failed to create chat session')
        }

        const { client_secret } = await res.json()
        return client_secret
      },
    },
  })

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
        <HugeiconsIcon icon={Loading03Icon} className="h-10 w-10 animate-spin"/>
        </div>
      </div>
    )
  }

  if (!session) {
    redirect('/auth/signin')
    return null
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
