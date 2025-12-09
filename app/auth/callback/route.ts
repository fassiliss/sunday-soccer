import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    if (code) {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data.user) {
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', data.user.id)
                .single()

            if (!existingProfile) {
                const email = data.user.email || ''
                const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '')

                await supabase.from('profiles').insert({
                    id: data.user.id,
                    username: username + '_' + Date.now().toString().slice(-4),
                    full_name: data.user.user_metadata?.full_name || username,
                    avatar_url: data.user.user_metadata?.avatar_url,
                    status: 'online' as const,
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
                        role: 'member' as const,
                    })
                }
            }

            return NextResponse.redirect(`${origin}/channel/general`)
        }
    }

    return NextResponse.redirect(`${origin}/auth/login?error=Could not authenticate`)
}