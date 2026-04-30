'use client'

import { Channel } from '@/lib/types/database'
import { Hash, MapPin, Users } from 'lucide-react'

export default function ChannelHeader({ channel }: { channel: Channel }) {
    return (
        <header className="shrink-0 border-b border-white/10 bg-[#0b1614]/92 px-4 py-3 backdrop-blur-xl sm:px-5">
            <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-lime-300 text-lime-950">
                        <Hash size={20} />
                    </div>
                    <div className="min-w-0">
                        <h2 className="truncate text-base font-black text-white sm:text-lg">{channel.name}</h2>
                        <p className="truncate text-xs font-medium text-slate-400">
                            {channel.description || 'Daily team text room'}
                        </p>
                    </div>
                </div>
                <button className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/8 text-slate-200 transition hover:bg-white/12" aria-label="View players">
                    <Users size={18} />
                </button>
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
                <div className="flex shrink-0 items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 font-semibold text-emerald-100">
                    <span className="h-2 w-2 rounded-full bg-emerald-300" />
                    Live team chat
                </div>
                <div className="flex shrink-0 items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 font-semibold text-cyan-100">
                    <MapPin size={14} />
                    Sunday field
                </div>
            </div>
        </header>
    )
}
