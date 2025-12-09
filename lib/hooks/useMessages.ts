'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageWithRelations } from '@/lib/types/database'

export function useMessages(channelId: string) {
    const [messages, setMessages] = useState<MessageWithRelations[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetchMessages = useCallback(async () => {
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
        fetchMessages()

        const channel = supabase
            .channel(`messages:${channelId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `channel_id=eq.${channelId}`
            }, async (payload) => {
                const { data } = await supabase
                    .from('messages')
                    .select(`*, user:profiles(*), attachments(*), reactions(*)`)
                    .eq('id', payload.new.id)
                    .single()
                if (data) setMessages(prev => [...prev, data as MessageWithRelations])
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
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        const { data } = await supabase
            .from('messages')
            .insert({ channel_id: channelId, user_id: user.id, content, type: 'text' })
            .select()
            .single()

        return data
    }

    return { messages, loading, sendMessage, refetch: fetchMessages }
}