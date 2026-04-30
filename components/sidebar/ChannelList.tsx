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
        return <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-11 animate-pulse rounded-2xl bg-white/10" />)}</div>
    }

    return (
        <div className="space-y-1.5">
            {channels.map(channel => {
                const isActive = currentChannelId === channel.id || currentChannelId === channel.name
                return (
                    <Link key={channel.id} href={`/channel/${channel.id}`} onClick={onChannelClick}
                          className={`flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2 text-sm transition ${isActive ? 'bg-emerald-300 text-emerald-950 shadow-lg shadow-emerald-950/20' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
                        <span className={`grid h-8 w-8 place-items-center rounded-full ${isActive ? 'bg-emerald-950/10' : 'bg-white/8'}`}>
                            <Hash size={15} />
                        </span>
                        <span className="truncate font-semibold">{channel.name}</span>
                    </Link>
                )
            })}
        </div>
    )
}
