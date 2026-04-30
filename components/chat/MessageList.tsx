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
    const containerRef = useRef<HTMLDivElement>(null)
    const bottomRef = useRef<HTMLDivElement>(null)

    // Scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center bg-[#0b1614]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-300/20 border-b-emerald-300"></div>
            </div>
        )
    }

    return (
        <div
            ref={containerRef}
            className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[linear-gradient(180deg,_rgba(11,22,20,0.90),_rgba(15,29,27,0.82))] px-3 py-4 sm:px-5"
        >
            {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center px-4 text-center">
                    <div className="max-w-sm">
                        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-[1.4rem] bg-emerald-300 text-3xl text-emerald-950">⚽</div>
                        <h3 className="text-lg font-black text-white">Start today&apos;s team thread</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-400">Send who is in, who needs a ride, field updates, and post-game photos.</p>
                    </div>
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
