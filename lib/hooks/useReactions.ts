'use client'

import { useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useReactions() {
    const supabase = useMemo(() => createClient(), [])

    const toggleReaction = async (messageId: string, emoji: string, hasReacted: boolean) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return false

        if (hasReacted) {
            await (supabase.from('reactions') as any).delete()
                .match({ message_id: messageId, user_id: user.id, emoji })
        } else {
            await (supabase.from('reactions') as any).upsert({
                message_id: messageId,
                user_id: user.id,
                emoji
            })
        }
        return true
    }

    return { toggleReaction }
}