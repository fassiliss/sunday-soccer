'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useMessages, usePresence } from '@/lib/hooks'
import { Channel, Profile } from '@/lib/types/database'
import MessageList from '@/components/chat/MessageList'
import MessageInput from '@/components/chat/MessageInput'
import ChannelHeader from '@/components/chat/ChannelHeader'

export default function ChannelPage() {
    const params = useParams()
    const channelIdParam = params.id as string
    const [channel, setChannel] = useState<Channel | null>(null)
    const [currentUser, setCurrentUser] = useState<Profile | null>(null)
    const supabase = useMemo(() => createClient(), [])

    // Use the actual channel UUID, not the URL param
    const { messages, loading, sendMessage } = useMessages(channel?.id || '')
    usePresence()

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
                setCurrentUser(profile)
            }

            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
            const { data: channelData } = uuidRegex.test(channelIdParam)
                ? await supabase.from('channels').select('*').eq('id', channelIdParam).single()
                : await supabase.from('channels').select('*').eq('name', channelIdParam).single()

            setChannel(channelData)
        }

        fetchData()
    }, [channelIdParam, supabase])

    if (!channel) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col">
            <ChannelHeader channel={channel} />
            <MessageList messages={messages} loading={loading} currentUserId={currentUser?.id} />
            <MessageInput onSend={sendMessage} channelName={channel.name} channelId={channel.id} />
        </div>
    )
}