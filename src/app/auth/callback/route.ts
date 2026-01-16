
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const cookieStoreVal = await cookies()

        // Track cookies that need to be set on the response
        const cookiesToSetOnResponse: Array<{ name: string; value: string; options: any }> = []

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStoreVal.getAll()
                    },
                    setAll(cookiesToSet) {
                        // Store cookies to apply to response later
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookiesToSetOnResponse.push({ name, value, options })
                        })
                        // Also try to set on cookieStore (may fail in some contexts)
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStoreVal.set(name, value, options)
                            )
                        } catch {
                            // Ignore - we'll set on the response object directly
                        }
                    },
                },
            }
        )

        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            const response = NextResponse.redirect(`${origin}${next}`)

            // Apply all auth cookies to the redirect response
            cookiesToSetOnResponse.forEach(({ name, value, options }) => {
                response.cookies.set(name, value, options)
            })

            return response
        }
    }

    return NextResponse.redirect(`${origin}/login?error=auth-code-error`)
}
