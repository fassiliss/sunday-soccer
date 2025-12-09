'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, Loader2 } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password })

        if (loginError) {
            setError(loginError.message)
            setLoading(false)
            return
        }

        if (data.user) {
            // Check if user is banned
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_banned, banned_reason')
                .eq('id', data.user.id)
                .single()

            if (profile?.is_banned) {
                await supabase.auth.signOut()
                setError(`You have been banned. Reason: ${profile.banned_reason || 'No reason provided'}`)
                setLoading(false)
                return
            }

            router.push('/channel/general')
            router.refresh()
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-900">
            <Header />
            <main className="flex-1 flex items-center justify-center px-4">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center text-3xl mb-4">⚽</div>
                        <h2 className="text-3xl font-bold text-white">Smyrna Soccer</h2>
                        <p className="mt-2 text-gray-400">Sign in to your team chat</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm">{error}</div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
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
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
                        >
                            {loading ? <><Loader2 className="animate-spin" size={20} /> Signing in...</> : 'Sign in'}
                        </button>
                    </form>

                    <p className="text-center text-gray-400">
                        Don't have an account? <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300">Sign up</Link>
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    )
}