'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, User, Loader2 } from 'lucide-react'

export default function SignupPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [username, setUsername] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const supabase = createClient()

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName, username } },
        })

        if (signUpError) {
            setError(signUpError.message)
            setLoading(false)
            return
        }

        if (data.user) {
            await supabase.from('profiles').insert({
                id: data.user.id,
                username,
                full_name: fullName,
                status: 'online',
            })

            const { data: generalChannel } = await supabase
                .from('channels')
                .select('id')
                .eq('name', 'general')
                .single()

            if (generalChannel) {
                await supabase.from('channel_members').insert({
                    channel_id: generalChannel.id,
                    user_id: data.user.id,
                    role: 'member',
                })
            }

            setSuccess(true)
        }

        setLoading(false)
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-3xl">✓</div>
                    <h2 className="text-2xl font-bold text-white">Check your email</h2>
                    <p className="text-gray-400">We sent a confirmation link to <strong>{email}</strong></p>
                    <Link href="/auth/login" className="text-blue-400 hover:text-blue-300">Back to login</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center text-3xl mb-4">⚽</div>
                    <h2 className="text-3xl font-bold text-white">Join the team</h2>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm">{error}</div>
                )}

                <form onSubmit={handleSignup} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Full name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required
                                   className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white" placeholder="John Doe"/>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} required
                                   className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white" placeholder="johndoe"/>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                                   className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white" placeholder="you@example.com"/>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                                   className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white" placeholder="••••••••"/>
                        </div>
                    </div>

                    <button type="submit" disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2">
                        {loading ? <><Loader2 className="animate-spin" size={20} /> Creating...</> : 'Create account'}
                    </button>
                </form>

                <p className="text-center text-gray-400">
                    Already have an account? <Link href="/auth/login" className="text-blue-400 hover:text-blue-300">Sign in</Link>
                </p>
            </div>
        </div>
    )
}