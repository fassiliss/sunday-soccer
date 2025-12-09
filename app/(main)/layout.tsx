import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/sidebar/Sidebar'

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
        <div className="flex flex-col h-screen bg-gray-900">
            {/* Header - Full Width */}
            <header className="w-full h-16 bg-gradient-to-r from-green-700 to-green-600 border-b border-green-500 flex items-center justify-between px-6 shrink-0 shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-2xl shadow">⚽</div>
                    <div>
                        <span className="font-bold text-white text-xl">Smyrna Soccer</span>
                        <p className="text-green-200 text-xs">Team Chat • {memberCount || 0} members</p>
                    </div>
                </div>
                <nav className="flex items-center gap-6">
                    <a
                        href="https://smyrnasoccer.com"
                        className="text-sm text-green-100 hover:text-white font-medium"
                    >
                        Home
                    </a>
                    <a
                        href="https://www.fassiltsegaye.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-green-100 hover:text-white font-medium"
                    >
                        About Developer
                    </a>
                </nav>
            </header>

            {/* Main Content with Sidebar */}
            <div className="flex flex-1 overflow-hidden">
                <Sidebar user={user} profile={profile} />
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Chat area */}
                    <main className="flex-1 flex flex-col overflow-hidden">{children}</main>

                    {/* Spacer/Divider */}
                    <div className="h-2 bg-gray-900 shrink-0"></div>

                    {/* Footer - Under writing section */}
                    <footer className="w-full h-12 bg-gray-950 border-t-2 border-gray-700 flex items-center justify-center px-4 shrink-0">
                        <p className="text-xs text-gray-500">
                            © 2025 Smyrna Soccer • Created by{' '}
                            <a
                                href="https://www.fassiltsegaye.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-white"
                            >
                                fassiltsegaye.com
                            </a>
                            {' '}•{' '}
                            <a
                                href="https://github.com/fassiliss/sunday-soccer"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-white"
                            >
                                GitHub
                            </a>
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    )
}