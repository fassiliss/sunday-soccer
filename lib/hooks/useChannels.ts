'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Channel } from '@/lib/types/database'

export function useChannels() {
    const [channels, setChannels] = useState<Channel[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetchChannels = useCallback(async () => {
        setLoading(true)
        const { data } = await supabase
            .from('channels')
            .select('*')
            .order('name')

        if (data) setChannels(data)
        setLoading(false)
    }, [supabase])

    useEffect(() => {
        fetchChannels()
    }, [fetchChannels])

    const createChannel = async (name: string, description?: string) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        const { data: channel } = await supabase
            .from('channels')
            .insert({ name, description, type: 'group', is_private: false })
            .select()
            .single()

        if (channel) {
            await supabase.from('channel_members').insert({
                channel_id: channel.id,
                user_id: user.id,
                role: 'admin'
            })
            await fetchChannels()
        }

        return channel
    }

    return { channels, loading, createChannel, refetch: fetchChannels }
}