import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('[API LOGIN] Starting login process')

    const { email, password, redirectedFrom } = await request.json()

    console.log('[API LOGIN] Email:', email)
    console.log('[API LOGIN] Redirect target:', redirectedFrom || '/')

    const cookieStore = await cookies()

    // Track all cookies that will be set
    const cookiesToSet: Array<{ name: string; value: string; options: any }> = []

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(newCookies) {
                    // Store cookies to apply to response later
                    newCookies.forEach(({ name, value, options }) => {
                        cookiesToSet.push({ name, value, options })
                        // Also set on cookieStore
                        try {
                            cookieStore.set(name, value, {
                                ...options,
                                path: '/',
                                sameSite: 'lax',
                                secure: process.env.NODE_ENV === 'production',
                            })
                        } catch (e) {
                            console.log('[API LOGIN] Error setting cookie on store:', name)
                        }
                    })
                },
            },
        }
    )

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.log('[API LOGIN] ❌ ERROR:', error.message)

        // Supabase returns the same "Invalid login credentials" whether the account
        // does not exist or the password is wrong. Tell the user which it is.
        if (error.message.toLowerCase().includes('invalid login credentials')) {
            const existing = await prisma.user.findUnique({ where: { email } })
            if (!existing) {
                return NextResponse.json(
                    {
                        error: "No account found with this email. Please sign up to get started.",
                        code: 'ACCOUNT_NOT_FOUND'
                    },
                    { status: 401 }
                )
            }
            return NextResponse.json(
                { error: "Incorrect password. Please try again or reset your password.", code: 'WRONG_PASSWORD' },
                { status: 401 }
            )
        }

        return NextResponse.json({ error: error.message }, { status: 401 })
    }

    console.log('[API LOGIN] ✅ SUCCESS')
    console.log('[API LOGIN] User ID:', data.user?.id)
    console.log('[API LOGIN] Session exists:', !!data.session)
    console.log('[API LOGIN] Cookies to set:', cookiesToSet.length)

    // Create redirect response
    const targetPath = redirectedFrom || '/'
    const response = NextResponse.json({
        success: true,
        redirectTo: targetPath
    })

    // Apply all cookies to the response with explicit attributes
    cookiesToSet.forEach(({ name, value, options }) => {
        const cookieOptions = {
            ...options,
            path: '/',
            sameSite: 'lax' as const,
            secure: true,
        }

        // Only apply long maxAge if the cookie isn't being deleted (value is not empty)
        if (value && !cookieOptions.maxAge) {
            cookieOptions.maxAge = 60 * 60 * 24 * 30 // 30 days
        }

        response.cookies.set(name, value, cookieOptions)
    })

    console.log('[API LOGIN] Returning success response')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    return response
}
