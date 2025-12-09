'use client'

import { useEffect, useRef } from 'react'
import { MessageWithRelations } from '@/lib/types/database'
import MessageItem from './MessageItem'

interface MessageListProps {
    messages: MessageWithRelations[]
    loading: boolean
    currentUserId?: string
}

export default function MessageList({ messages, loading, currentUserId }: MessageListProps) {
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            {messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                    <p>No messages yet. Start the conversation!</p>
                </div>
            ) : (
                messages.map((message) => (
                    <MessageItem
                        key={message.id}
                        message={message}
                        isOwn={message.user_id === currentUserId}
                        currentUserId={currentUserId}
                    />
                ))
            )}
            <div ref={bottomRef} />
        </div>
    )
}