import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    return NextResponse.json({
        environment: process.env.NODE_ENV,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        user: user ? { id: user.id, email: user.email } : null,
        error: error?.message || null,
        timestamp: new Date().toISOString()
    })
}
