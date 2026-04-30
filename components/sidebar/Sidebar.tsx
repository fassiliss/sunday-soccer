'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { Channel, Profile } from '@/lib/types/database'
import { createClient } from '@/lib/supabase/client'
import { useChannels } from '@/lib/hooks'
import ChannelList from './ChannelList'
import ProfileSettings from '../ui/ProfileSettings'
import { Search, Plus, X, Menu, LogOut, Settings, Shield, MessageCircle, Trophy } from 'lucide-react'

interface SidebarProps {
    user: User
    profile: Profile | null
}

export default function Sidebar({ user, profile }: SidebarProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [showCreate, setShowCreate] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [currentProfile, setCurrentProfile] = useState(profile)
    const [newChannelName, setNewChannelName] = useState('')
    const { channels, loading, createChannel } = useChannels()
    const router = useRouter()
    const supabase = useMemo(() => createClient(), [])

    const filteredChannels = channels.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))

    const handleCreate = async () => {
        if (!newChannelName.trim()) return
        const channel = await createChannel(newChannelName.trim()) as Channel | null
        if (channel?.id) {
            setNewChannelName('')
            setShowCreate(false)
            router.push(`/channel/${channel.id}`)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/auth/login')
    }

    const refreshProfile = async () => {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (data) setCurrentProfile(data as Profile)
    }

    return (
        <>
            {/* Mobile team drawer trigger */}
            <button
                onClick={() => setIsOpen(true)}
                aria-label="Open team channels"
                className="fixed bottom-[calc(env(safe-area-inset-bottom)+18px)] left-4 z-50 grid h-12 w-12 place-items-center rounded-full bg-emerald-300 text-emerald-950 shadow-2xl shadow-black/40 transition hover:bg-emerald-200 md:hidden"
            >
                <Menu size={23} />
            </button>

            {/* Overlay */}
            {isOpen && <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setIsOpen(false)} />}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 flex w-[min(86vw,21rem)] flex-col border-r border-white/10 bg-[#08110f]/95 pt-[env(safe-area-inset-top)] shadow-2xl shadow-black/30 backdrop-blur-xl transition-transform duration-300 md:relative md:w-72 md:translate-x-0 md:bg-[#08110f]/72 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between border-b border-white/10 p-4">
                    <div className="flex items-center gap-2">
                        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-300 text-xl text-emerald-950">⚽</div>
                        <div>
                            <span className="font-bold text-white">EU Soccer</span>
                            <p className="text-xs text-emerald-200/75">Daily soccer texts</p>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="rounded-full p-2 text-slate-300 hover:bg-white/10 hover:text-white md:hidden">
                        <X size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3">
                    <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-3">
                        <MessageCircle size={17} className="mb-2 text-emerald-200" />
                        <p className="text-xs font-bold text-white">Text team</p>
                    </div>
                    <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-3">
                        <Trophy size={17} className="mb-2 text-amber-200" />
                        <p className="text-xs font-bold text-white">Game day</p>
                    </div>
                </div>

                <div className="px-3 pb-3">
                    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-3 py-2">
                        <Search size={16} className="text-slate-400" />
                        <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                               className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-3">
                    <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        <span>Channels</span>
                        <button onClick={() => setShowCreate(true)} className="rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Create channel"><Plus size={16} /></button>
                    </div>

                    {showCreate && (
                        <div className="mb-3 rounded-2xl border border-white/10 bg-white/8 p-3">
                            <input type="text" placeholder="channel-name" value={newChannelName}
                                   onChange={(e) => setNewChannelName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                   onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                                   className="mb-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500" autoFocus />
                            <div className="flex gap-2">
                                <button onClick={handleCreate} className="flex-1 rounded-xl bg-emerald-300 py-2 text-xs font-bold text-emerald-950">Create</button>
                                <button onClick={() => setShowCreate(false)} className="flex-1 rounded-xl bg-white/10 py-2 text-xs font-bold text-white">Cancel</button>
                            </div>
                        </div>
                    )}

                    <ChannelList channels={filteredChannels} loading={loading} onChannelClick={() => setIsOpen(false)} />

                    {/* Admin Link - Only show for admins */}
                    {currentProfile?.is_admin && (
                        <div className="mt-4 border-t border-white/10 pt-4">
                            <Link
                                href="/admin"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-2 rounded-2xl px-3 py-2 text-amber-300 hover:bg-white/10"
                            >
                                <Shield size={16} />
                                <span className="text-sm font-medium">Admin Panel</span>
                            </Link>
                        </div>
                    )}
                </div>

                <div className="border-t border-white/10 p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
                    <div className="flex items-center gap-2">
                        <div
                            className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-cyan-500 text-sm font-bold text-white"
                            onClick={() => setShowSettings(true)}
                        >
                            {currentProfile?.avatar_url ? (
                                <img src={currentProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                currentProfile?.full_name?.charAt(0) || 'U'
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate text-white">{currentProfile?.full_name || 'User'}</div>
                            <div className="text-xs text-emerald-300">Available now</div>
                        </div>
                        <button onClick={() => setShowSettings(true)} className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Open profile settings">
                            <Settings size={16} />
                        </button>
                        <button onClick={handleLogout} className="rounded-full p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-300" aria-label="Log out">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {showSettings && currentProfile && (
                <ProfileSettings
                    profile={currentProfile}
                    onClose={() => setShowSettings(false)}
                    onUpdate={refreshProfile}
                />
            )}
        </>
    )
}
