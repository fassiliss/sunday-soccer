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

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4">👋</div>
                    <h3 className="text-lg font-medium text-white">No messages yet</h3>
                    <p className="text-gray-400">Be the first to say something!</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map(message => (
                <MessageItem key={message.id} message={message} isOwn={message.user_id === currentUserId} currentUserId={currentUserId} />
            ))}
            <div ref={bottomRef} />
        </div>
    )
}