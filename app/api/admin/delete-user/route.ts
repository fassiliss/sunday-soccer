import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
    const { userId, adminId } = await request.json()

    // Verify admin
    const { data: admin } = await supabaseAdmin
        .from('profiles')
        .select('is_admin')
        .eq('id', adminId)
        .single()

    if (!admin?.is_admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete user data
    await supabaseAdmin.from('messages').delete().eq('user_id', userId)
    await supabaseAdmin.from('reactions').delete().eq('user_id', userId)
    await supabaseAdmin.from('channel_members').delete().eq('user_id', userId)
    await supabaseAdmin.from('profiles').delete().eq('id', userId)

    // Delete from auth.users
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}