'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Channel } from '@/lib/types/database'
import { Hash } from 'lucide-react'

interface ChannelListProps {
    channels: Channel[]
    loading: boolean
    onChannelClick?: () => void
}

export default function ChannelList({ channels, loading, onChannelClick }: ChannelListProps) {
    const params = useParams()
    const currentChannelId = params.id as string

    if (loading) {
        return <div className="space-y-1">{[1,2,3].map(i => <div key={i} className="animate-pulse h-8 bg-gray-700 rounded" />)}</div>
    }

    return (
        <div className="space-y-0.5">
            {channels.map(channel => {
                const isActive = currentChannelId === channel.id || currentChannelId === channel.name
                return (
                    <Link key={channel.id} href={`/channel/${channel.id}`} onClick={onChannelClick}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm ${isActive ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}>
                        <Hash size={16} />
                        <span>{channel.name}</span>
                    </Link>
                )
            })}
        </div>
    )
}