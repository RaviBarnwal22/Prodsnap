import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            // Force specific cookie attributes for Vercel
                            const cookieOptions = {
                                ...options,
                                path: '/',
                                sameSite: 'none' as const, // Essential for Vercel/Chrome session persistence
                                secure: true,              // Required when sameSite is 'none'
                                httpOnly: true,
                                maxAge: 60 * 60 * 24 * 30, // 30 days
                            }
                            cookieStore.set(name, value, cookieOptions)
                        })
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}
