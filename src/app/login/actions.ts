'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('[SERVER ACTION] LOGIN STARTED')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const redirectedFrom = formData.get('redirectedFrom') as string

    console.log('[LOGIN] Email:', email)
    console.log('[LOGIN] Redirect target:', redirectedFrom || '/')

    const supabase = await createClient()
    console.log('[LOGIN] Supabase client created')

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.log('[LOGIN] ❌ ERROR:', error.message)
        return { error: error.message }
    }

    console.log('[LOGIN] ✅ SUCCESS')
    console.log('[LOGIN] User ID:', data.user?.id)
    console.log('[LOGIN] Session exists:', !!data.session)
    console.log('[LOGIN] Access token exists:', !!data.session?.access_token)

    // Check if cookies are being set
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    console.log('[LOGIN] Total cookies after auth:', allCookies.length)
    const authCookies = allCookies.filter(c => c.name.includes('auth'))
    console.log('[LOGIN] Auth cookies:', authCookies.map(c => ({
        name: c.name,
        hasValue: !!c.value,
        valueLength: c.value.length
    })))

    console.log('[LOGIN] Revalidating path...')
    revalidatePath('/', 'layout')

    const targetPath = redirectedFrom || '/'
    console.log('[LOGIN] Redirecting to:', targetPath)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    redirect(targetPath)
}
