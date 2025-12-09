'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, User, Phone, Loader2, CheckCircle } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function SignupPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [username, setUsername] = useState('')
    const [phone, setPhone] = useState('')
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
            // Create profile
            await (supabase.from('profiles') as any).insert({
                id: data.user.id,
                username,
                full_name: fullName,
                phone_number: phone || null,
                status: 'online',
            })

            // Get general channel
            const { data: generalChannel } = await (supabase
                .from('channels')
                .select('id')
                .eq('name', 'general')
                .single() as any)

            if (generalChannel?.id) {
                // Add to general channel
                await (supabase.from('channel_members') as any).insert({
                    channel_id: generalChannel.id,
                    user_id: data.user.id,
                    role: 'member',
                })

                // Post welcome message in general channel
                await (supabase.from('messages') as any).insert({
                    channel_id: generalChannel.id,
                    user_id: data.user.id,
                    content: `👋 ${fullName} just joined the team! Welcome to Smyrna Soccer! ⚽`,
                    type: 'system',
                })
            }

            // Add to all other channels
            const { data: allChannels } = await (supabase
                .from('channels')
                .select('id')
                .neq('name', 'general') as any)

            if (allChannels) {
                for (const channel of allChannels) {
                    await (supabase.from('channel_members') as any).insert({
                        channel_id: channel.id,
                        user_id: data.user.id,
                        role: 'member',
                    })
                }
            }

            setSuccess(true)
        }

        setLoading(false)
    }

    if (success) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-900">
                <Header />
                <main className="flex-1 flex items-center justify-center px-4">
                    <div className="max-w-md w-full text-center space-y-6">
                        <div className="mx-auto w-20 h-20 bg-green-600 rounded-full flex items-center justify-center">
                            <CheckCircle size={48} className="text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-white">Welcome to the Team! ⚽</h2>
                        <p className="text-gray-400 text-lg">
                            Thank you for joining <strong className="text-green-400">Smyrna Soccer</strong>, {fullName}!
                        </p>
                        <div className="bg-gray-800 rounded-lg p-4 text-left">
                            <p className="text-gray-300 text-sm mb-2">✅ Your account has been created</p>
                            <p className="text-gray-300 text-sm mb-2">✅ You've been added to all team channels</p>
                            <p className="text-gray-300 text-sm">✅ You're ready to start chatting!</p>
                        </div>
                        <Link
                            href="/auth/login"
                            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg"
                        >
                            Sign In Now
                        </Link>
                        <p className="text-gray-500 text-sm">
                            Check your email if confirmation is required
                        </p>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-900">
            <Header />
            <main className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center text-3xl mb-4">⚽</div>
                        <h2 className="text-3xl font-bold text-white">Join the Team</h2>
                        <p className="mt-2 text-gray-400">Create your Smyrna Soccer account</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm">{error}</div>
                    )}

                    <form onSubmit={handleSignup} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                    required
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="johndoe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number <span className="text-gray-500">(optional)</span></label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="••••••••"
                                />
                            </div>
                            <p className="text-gray-500 text-xs mt-1">Minimum 6 characters</p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
                        >
                            {loading ? <><Loader2 className="animate-spin" size={20} /> Creating account...</> : 'Join Smyrna Soccer ⚽'}
                        </button>
                    </form>

                    <p className="text-center text-gray-400">
                        Already have an account? <Link href="/auth/login" className="text-blue-400 hover:text-blue-300">Sign in</Link>
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    )
}