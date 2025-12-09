'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile, Channel } from '@/lib/types/database'
import { Shield, Trash2, Ban, UserX, MessageSquareX, Users, RefreshCw } from 'lucide-react'

export default function AdminPage() {
    const [currentUser, setCurrentUser] = useState<Profile | null>(null)
    const [members, setMembers] = useState<Profile[]>([])
    const [channels, setChannels] = useState<Channel[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const router = useRouter()
    const supabase = useMemo(() => createClient(), [])

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/auth/login')
                return
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            const profileData = profile as Profile | null

            if (!profileData?.is_admin) {
                router.push('/channel/general')
                return
            }

            setCurrentUser(profileData)

            // Fetch all members
            const { data: membersData } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })

            if (membersData) setMembers(membersData as Profile[])

            // Fetch all channels
            const { data: channelsData } = await supabase
                .from('channels')
                .select('*')
                .order('name')

            if (channelsData) setChannels(channelsData as Channel[])

            setLoading(false)
        }

        fetchData()
    }, [supabase, router])

    const refreshData = async () => {
        setLoading(true)
        const { data: membersData } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })
        if (membersData) setMembers(membersData as Profile[])
        setLoading(false)
    }

    const banUser = async (userId: string, reason: string) => {
        if (!confirm(`Are you sure you want to ban this user?\nReason: ${reason}`)) return
        setActionLoading(userId)

        await (supabase.from('profiles') as any)
            .update({
                is_banned: true,
                banned_at: new Date().toISOString(),
                banned_reason: reason
            })
            .eq('id', userId)

        await refreshData()
        setActionLoading(null)
    }

    const unbanUser = async (userId: string) => {
        if (!confirm('Are you sure you want to unban this user?')) return
        setActionLoading(userId)

        await (supabase.from('profiles') as any)
            .update({
                is_banned: false,
                banned_at: null,
                banned_reason: null
            })
            .eq('id', userId)

        await refreshData()
        setActionLoading(null)
    }

    const deleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to DELETE this user? This cannot be undone!')) return
        setActionLoading(userId)

        // Delete user's messages
        await (supabase.from('messages') as any).delete().eq('user_id', userId)

        // Delete user's reactions
        await (supabase.from('reactions') as any).delete().eq('user_id', userId)

        // Delete user's channel memberships
        await (supabase.from('channel_members') as any).delete().eq('user_id', userId)

        // Delete user's profile
        await (supabase.from('profiles') as any).delete().eq('id', userId)

        await refreshData()
        setActionLoading(null)
    }

    const makeAdmin = async (userId: string) => {
        if (!confirm('Make this user an admin?')) return
        setActionLoading(userId)

        await (supabase.from('profiles') as any)
            .update({ is_admin: true })
            .eq('id', userId)

        await refreshData()
        setActionLoading(null)
    }

    const removeAdmin = async (userId: string) => {
        if (!confirm('Remove admin rights from this user?')) return
        setActionLoading(userId)

        await (supabase.from('profiles') as any)
            .update({ is_admin: false })
            .eq('id', userId)

        await refreshData()
        setActionLoading(null)
    }

    const clearChannelMessages = async (channelId: string, channelName: string) => {
        if (!confirm(`Are you sure you want to delete ALL messages in #${channelName}? This cannot be undone!`)) return
        setActionLoading(channelId)

        await (supabase.from('messages') as any).delete().eq('channel_id', channelId)

        setActionLoading(null)
        alert(`All messages in #${channelName} have been deleted.`)
    }

    const clearAllMessages = async () => {
        if (!confirm('Are you sure you want to delete ALL messages from ALL channels? This cannot be undone!')) return
        if (!confirm('This is your FINAL warning. ALL messages will be permanently deleted. Continue?')) return

        setActionLoading('all')
        await (supabase.from('messages') as any).delete().neq('id', '00000000-0000-0000-0000-000000000000')
        setActionLoading(null)
        alert('All messages have been deleted.')
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-900">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (!currentUser?.is_admin) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-900">
                <p className="text-red-500">Access Denied. Admins only.</p>
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-y-auto bg-gray-900 p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Shield className="text-yellow-500" size={32} />
                    <div>
                        <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                        <p className="text-gray-400 text-sm">Manage members and chat</p>
                    </div>
                    <button
                        onClick={refreshData}
                        className="ml-auto p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-800 rounded-lg p-4">
                        <p className="text-gray-400 text-sm">Total Members</p>
                        <p className="text-2xl font-bold text-white">{members.length}</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                        <p className="text-gray-400 text-sm">Admins</p>
                        <p className="text-2xl font-bold text-yellow-500">{members.filter(m => m.is_admin).length}</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                        <p className="text-gray-400 text-sm">Banned</p>
                        <p className="text-2xl font-bold text-red-500">{members.filter(m => m.is_banned).length}</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                        <p className="text-gray-400 text-sm">Channels</p>
                        <p className="text-2xl font-bold text-green-500">{channels.length}</p>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
                    <h2 className="text-red-500 font-semibold mb-3 flex items-center gap-2">
                        <MessageSquareX size={20} />
                        Danger Zone
                    </h2>
                    <button
                        onClick={clearAllMessages}
                        disabled={actionLoading === 'all'}
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm"
                    >
                        {actionLoading === 'all' ? 'Deleting...' : 'Delete ALL Messages'}
                    </button>
                </div>

                {/* Channels */}
                <div className="bg-gray-800 rounded-lg p-4 mb-6">
                    <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <MessageSquareX size={20} />
                        Clear Channel Messages
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {channels.map(channel => (
                            <button
                                key={channel.id}
                                onClick={() => clearChannelMessages(channel.id, channel.name)}
                                disabled={actionLoading === channel.id}
                                className="bg-gray-700 hover:bg-red-600 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm transition"
                            >
                                #{channel.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Members List */}
                <div className="bg-gray-800 rounded-lg p-4">
                    <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <Users size={20} />
                        Members ({members.length})
                    </h2>
                    <div className="space-y-3">
                        {members.map(member => (
                            <div
                                key={member.id}
                                className={`flex items-center gap-3 p-3 rounded-lg ${member.is_banned ? 'bg-red-900/30' : 'bg-gray-700'}`}
                            >
                                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                                    {member.full_name?.charAt(0) || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-medium truncate">{member.full_name || member.username}</span>
                                        {member.is_admin && (
                                            <span className="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded">Admin</span>
                                        )}
                                        {member.is_banned && (
                                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded">Banned</span>
                                        )}
                                    </div>
                                    <p className="text-gray-400 text-xs truncate">@{member.username}</p>
                                    {member.is_banned && member.banned_reason && (
                                        <p className="text-red-400 text-xs">Reason: {member.banned_reason}</p>
                                    )}
                                </div>

                                {/* Actions */}
                                {member.id !== currentUser.id && (
                                    <div className="flex items-center gap-1">
                                        {/* Admin Toggle */}
                                        {member.is_admin ? (
                                            <button
                                                onClick={() => removeAdmin(member.id)}
                                                disabled={actionLoading === member.id}
                                                className="p-2 bg-yellow-600 hover:bg-yellow-700 rounded text-white text-xs"
                                                title="Remove Admin"
                                            >
                                                <Shield size={16} />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => makeAdmin(member.id)}
                                                disabled={actionLoading === member.id}
                                                className="p-2 bg-gray-600 hover:bg-yellow-600 rounded text-white text-xs"
                                                title="Make Admin"
                                            >
                                                <Shield size={16} />
                                            </button>
                                        )}

                                        {/* Ban/Unban */}
                                        {member.is_banned ? (
                                            <button
                                                onClick={() => unbanUser(member.id)}
                                                disabled={actionLoading === member.id}
                                                className="p-2 bg-green-600 hover:bg-green-700 rounded text-white text-xs"
                                                title="Unban"
                                            >
                                                <UserX size={16} />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    const reason = prompt('Enter ban reason:')
                                                    if (reason) banUser(member.id, reason)
                                                }}
                                                disabled={actionLoading === member.id}
                                                className="p-2 bg-gray-600 hover:bg-orange-600 rounded text-white text-xs"
                                                title="Ban User"
                                            >
                                                <Ban size={16} />
                                            </button>
                                        )}

                                        {/* Delete */}
                                        <button
                                            onClick={() => deleteUser(member.id)}
                                            disabled={actionLoading === member.id}
                                            className="p-2 bg-gray-600 hover:bg-red-600 rounded text-white text-xs"
                                            title="Delete User"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}