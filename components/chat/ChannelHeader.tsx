'use client'

import { Channel } from '@/lib/types/database'
import { Hash, Users } from 'lucide-react'

export default function ChannelHeader({ channel }: { channel: Channel }) {
    return (
        <header className="h-14 px-4 flex items-center justify-between border-b border-gray-700 bg-gray-800">
            <div className="flex items-center gap-3">
                <Hash size={20} className="text-gray-400" />
                <div>
                    <h1 className="font-semibold text-white">{channel.name}</h1>
                    {channel.description && <p className="text-xs text-gray-400">{channel.description}</p>}
                </div>
            </div>
            <button className="p-2 text-gray-400 hover:text-white rounded-lg"><Users size={18} /></button>
        </header>
    )
}