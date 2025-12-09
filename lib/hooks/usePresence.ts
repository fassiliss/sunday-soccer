'use client'

import { useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePresence() {
    const supabase = createClient()

    const updatePresence = useCallback(async (status: 'online' | 'offline' | 'away') => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        await supabase.from('profiles').update({
            status,
            last_seen: new Date().toISOString()
        }).eq('id', user.id)
    }, [supabase])

    useEffect(() => {
        updatePresence('online')
        const heartbeat = setInterval(() => updatePresence('online'), 30000)

        const handleVisibilityChange = () => {
            updatePresence(document.hidden ? 'away' : 'online')
        }
        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            clearInterval(heartbeat)
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            updatePresence('offline')
        }
    }, [updatePresence])

    return { updatePresence }
}