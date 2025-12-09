'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { Profile } from '@/lib/types/database'
import { createClient } from '@/lib/supabase/client'
import { useChannels } from '@/lib/hooks'
import ChannelList from './ChannelList'
import ProfileSettings from '../ui/ProfileSettings'
import { Search, Plus, X, Menu, LogOut, Settings } from 'lucide-react'

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
        const channel = await createChannel(newChannelName.trim()) as any
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
            <button onClick={() => setIsOpen(true)} className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg text-gray-400">
                <Menu size={24} />
            </button>

            {isOpen && <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />}

            <aside className={`fixed md:relative inset-y-0 left-0 z-50 w-64 bg-gray-800 flex flex-col transform transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">⚽</div>
                        <span className="font-semibold text-white">Sunday Soccer</span>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400"><X size={20} /></button>
                </div>

                <div className="p-3">
                    <div className="flex items-center gap-2 bg-gray-700 rounded-lg px-3 py-2">
                        <Search size={16} className="text-gray-400" />
                        <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                               className="bg-transparent text-sm w-full outline-none text-white placeholder-gray-400" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-3">
                    <div className="flex items-center justify-between text-xs text-gray-400 uppercase mb-2">
                        <span>Channels</span>
                        <button onClick={() => setShowCreate(true)} className="hover:text-white"><Plus size={16} /></button>
                    </div>

                    {showCreate && (
                        <div className="mb-3 bg-gray-700 rounded-lg p-3">
                            <input type="text" placeholder="channel-name" value={newChannelName}
                                   onChange={(e) => setNewChannelName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                   onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                                   className="w-full bg-gray-600 rounded px-2 py-1 text-sm mb-2 outline-none text-white" autoFocus />
                            <div className="flex gap-2">
                                <button onClick={handleCreate} className="flex-1 bg-blue-600 text-xs py-1 rounded text-white">Create</button>
                                <button onClick={() => setShowCreate(false)} className="flex-1 bg-gray-600 text-xs py-1 rounded text-white">Cancel</button>
                            </div>
                        </div>
                    )}

                    <ChannelList channels={filteredChannels} loading={loading} onChannelClick={() => setIsOpen(false)} />
                </div>

                <div className="p-3 border-t border-gray-700">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm text-white overflow-hidden cursor-pointer"
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
                            <div className="text-xs text-gray-400">Online</div>
                        </div>
                        <button onClick={() => setShowSettings(true)} className="p-1.5 text-gray-400 hover:text-white">
                            <Settings size={16} />
                        </button>
                        <button onClick={handleLogout} className="p-1.5 text-gray-400 hover:text-red-400">
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