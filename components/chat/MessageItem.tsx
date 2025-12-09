'use client'

import { useState } from 'react'
import { MessageWithRelations } from '@/lib/types/database'
import { useReactions } from '@/lib/hooks'
import { Smile, Trash2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const EMOJIS = ['👍', '❤️', '😂', '🔥', '⚽', '🎉']

export default function MessageItem({ message, isOwn, currentUserId }: { message: MessageWithRelations; isOwn: boolean; currentUserId?: string }) {
    const [showPicker, setShowPicker] = useState(false)
    const [deleted, setDeleted] = useState(false)
    const [expandedImage, setExpandedImage] = useState<string | null>(null)
    const { toggleReaction } = useReactions()
    const supabase = createClient()
    const user = message.user
    const userName = user?.full_name || user?.username || 'Unknown'

    const groupedReactions = message.reactions.reduce((acc, r) => {
        if (!acc[r.emoji]) acc[r.emoji] = { count: 0, hasUserReacted: false }
        acc[r.emoji].count++
        if (r.user_id === currentUserId) acc[r.emoji].hasUserReacted = true
        return acc
    }, {} as Record<string, { count: number; hasUserReacted: boolean }>)

    const handleReaction = async (emoji: string) => {
        const hasReacted = groupedReactions[emoji]?.hasUserReacted || false
        await toggleReaction(message.id, emoji, hasReacted)
        setShowPicker(false)
    }

    const handleDelete = async () => {
        if (!confirm('Delete this message?')) return
        await (supabase.from('messages') as any)
            .update({ is_deleted: true })
            .eq('id', message.id)
        setDeleted(true)
    }

    const renderContent = (text: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g
        const parts = text.split(urlRegex)

        return parts.map((part, i) => {
            if (part.match(urlRegex)) {
                if (part.match(/\.(jpg|jpeg|png|gif|webp)($|\?)/i)) {
                    return (
                        <img
                            key={i}
                            src={part}
                            alt="Shared image"
                            className="max-w-full rounded-lg mt-2 max-h-48 object-contain cursor-pointer hover:opacity-90 transition"
                            onClick={() => setExpandedImage(part)}
                        />
                    )
                }
                return (
                    <a
                        key={i}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline break-all"
                    >
                        {part}
                    </a>
                )
            }
            return part
        })
    }

    if (deleted) return null

    return (
        <>
            <div className={`group flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${isOwn ? 'bg-blue-600' : 'bg-gray-600'}`}>
                    {userName.charAt(0).toUpperCase()}
                </div>
                <div className={`max-w-lg ${isOwn ? 'text-right' : ''}`}>
                    <div className={`flex items-baseline gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                        <span className="text-sm font-medium text-white">{userName}</span>
                        <span className="text-xs text-gray-500">{new Date(message.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                    </div>
                    <div className={`inline-block px-4 py-2 rounded-2xl ${isOwn ? 'bg-blue-600 text-white rounded-tr-md' : 'bg-gray-700 text-white rounded-tl-md'}`}>
                        <p className="text-sm whitespace-pre-wrap">{renderContent(message.content || '')}</p>
                    </div>

                    {Object.keys(groupedReactions).length > 0 && (
                        <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                            {Object.entries(groupedReactions).map(([emoji, data]) => (
                                <button key={emoji} onClick={() => handleReaction(emoji)}
                                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${data.hasUserReacted ? 'bg-blue-600/30 border border-blue-500/50' : 'bg-gray-700'}`}>
                                    <span>{emoji}</span><span className="text-gray-300">{data.count}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className={`relative flex gap-2 ${isOwn ? 'justify-end' : ''}`}>
                        <button onClick={() => setShowPicker(!showPicker)} className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-300 text-xs mt-1">
                            <Smile size={14} className="inline mr-1" />React
                        </button>
                        {/* Delete button for all messages */}
                        <button onClick={handleDelete} className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 text-xs mt-1">
                            <Trash2 size={14} className="inline mr-1" />Delete
                        </button>
                        {showPicker && (
                            <div className={`absolute z-10 mt-6 bg-gray-700 rounded-lg p-2 flex gap-1 ${isOwn ? 'right-0' : 'left-0'}`}>
                                {EMOJIS.map(emoji => (
                                    <button key={emoji} onClick={() => handleReaction(emoji)} className="hover:bg-gray-600 p-1 rounded text-lg">{emoji}</button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Image Lightbox Modal */}
            {expandedImage && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setExpandedImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
                        onClick={() => setExpandedImage(null)}
                    >
                        <X size={32} />
                    </button>
                    <img
                        src={expandedImage}
                        alt="Expanded image"
                        className="max-w-full max-h-full object-contain rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <a
                        href={expandedImage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm"
                        onClick={(e) => e.stopPropagation()}
                    >
                        Open Original
                    </a>
                </div>
            )}
        </>
    )
}