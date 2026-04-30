import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/sidebar/Sidebar'
import PushNotification from '@/components/PushNotification'
import { Bell, CalendarDays, Home, ShieldCheck } from 'lucide-react'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Get member count
    const { count: memberCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

    return (
        <div className="app-shell h-dvh overflow-hidden bg-[#07130f] text-white">
            <div className="flex h-full overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(27,185,119,0.20),_transparent_34%),linear-gradient(135deg,_#07130f_0%,_#0f1d1b_52%,_#111827_100%)]">
                <Sidebar user={user} profile={profile} />

                <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                    <header className="shrink-0 border-b border-white/10 bg-[#07130f]/90 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+12px)] backdrop-blur-xl md:px-6 md:pt-4">
                        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-2xl shadow-lg shadow-emerald-950/40">⚽</div>
                                <div className="min-w-0">
                                    <p className="truncate text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300">Matchday mobile</p>
                                    <h1 className="truncate text-lg font-black leading-tight text-white md:text-xl">Ethio Unity</h1>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-emerald-100 sm:flex">
                                    <ShieldCheck size={15} />
                                    <span>{memberCount || 0} players</span>
                                </div>
                                <PushNotification userId={user.id} />
                                <a
                                    href="https://smyrnasoccer.com"
                                    aria-label="Ethio Unity home"
                                    className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-emerald-100 transition hover:bg-white/10"
                                >
                                    <Home size={18} />
                                </a>
                            </div>
                        </div>

                        <div className="mx-auto mt-3 grid w-full max-w-6xl grid-cols-[1fr_auto] items-center gap-2 rounded-[1.25rem] border border-emerald-300/20 bg-emerald-400/10 p-2 shadow-lg shadow-emerald-950/20">
                            <div className="flex min-w-0 items-center gap-3 px-2">
                                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-300 text-emerald-950">
                                    <CalendarDays size={18} />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-white">Today&apos;s team thread</p>
                                    <p className="truncate text-xs text-emerald-100/80">Lineups, rides, lateness, photos, and final score.</p>
                                </div>
                            </div>
                            <div className="grid h-9 w-9 place-items-center rounded-full bg-lime-300 text-lime-950">
                                <Bell size={17} />
                            </div>
                        </div>
                    </header>

                    <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col overflow-hidden md:px-4 md:py-4">
                        <div className="flex min-h-0 flex-1 overflow-hidden bg-[#0b1614]/72 shadow-2xl shadow-black/20 md:rounded-[1.75rem] md:border md:border-white/10">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}
