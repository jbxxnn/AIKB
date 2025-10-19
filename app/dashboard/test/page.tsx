'use client'

import { ChatKit, useChatKit } from '@openai/chatkit-react'

export default function TestPage() {
    const { control } = useChatKit({
        api: {
            getClientSecret: async (existing) => {
                return 'test'
            }
        }
    })
    return (
        <ChatKit 
            control={control} 
            className="h-full w-full rounded-sm"
        />
    )
}