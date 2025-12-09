'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageWithRelations } from '@/lib/types/database'

export function useMessages(channelId: string) {
    const [messages, setMessages] = useState<MessageWithRelations[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = useMemo(() => createClient(), [])

    const fetchMessages = useCallback(async () => {
        if (!channelId) {
            setLoading(false)
            return
        }

        setLoading(true)
        const { data } = await supabase
            .from('messages')
            .select(`*, user:profiles(*), attachments(*), reactions(*)`)
            .eq('channel_id', channelId)
            .eq('is_deleted', false)
            .order('created_at', { ascending: true })
            .limit(100)

        if (data) setMessages(data as MessageWithRelations[])
        setLoading(false)
    }, [channelId, supabase])

    useEffect(() => {
        if (!channelId) return

        fetchMessages()

        const channel = supabase
            .channel(`messages:${channelId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `channel_id=eq.${channelId}`
            }, async (payload) => {
                const { data: messageData } = await supabase
                    .from('messages')
                    .select(`*, user:profiles(*), attachments(*), reactions(*)`)
                    .eq('id', payload.new.id)
                    .single()

                if (messageData) {
                    setMessages(prev => [...prev, messageData as MessageWithRelations])

                    // Send browser notification
                    const { data: { user } } = await supabase.auth.getUser()
                    const msg = messageData as any

                    if (msg.user_id !== user?.id) {
                        const userName = msg.user?.full_name || 'Someone'
                        const content = msg.content || 'Sent a message'

                        // Browser notification
                        if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
                            new Notification(`${userName} - Smyrna Soccer`, {
                                body: content.substring(0, 100),
                                icon: '/favicon.ico',
                            })
                        }

                        // Play sound
                        const audio = new Audio('/notification.mp3')
                        audio.volume = 0.3
                        audio.play().catch(() => {})
                    }
                }
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'reactions',
            }, () => fetchMessages())
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [channelId, fetchMessages, supabase])

    const sendMessage = async (content: string) => {
        if (!channelId) return null

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        const { data } = await (supabase.from('messages') as any)
            .insert({ channel_id: channelId, user_id: user.id, content, type: 'text' })
            .select()
            .single()

        return data
    }

    return { messages, loading, sendMessage, refetch: fetchMessages }
}