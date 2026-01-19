import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname
    console.log(`[Middleware] ${pathname} - Start`)

    // Create response that we'll mutate with cookies
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    const cookie = request.cookies.get(name)?.value
                    console.log(`[Middleware] ${pathname} - GET cookie ${name}:`, cookie ? 'exists' : 'missing')
                    return cookie
                },
                set(name: string, value: string, options: any) {
                    console.log(`[Middleware] ${pathname} - SET cookie ${name}`)
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: any) {
                    console.log(`[Middleware] ${pathname} - REMOVE cookie ${name}`)
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    // CRITICAL: This refreshes the session
    const { data: { user }, error } = await supabase.auth.getUser()

    console.log(`[Middleware] ${pathname} - User:`, user ? `${user.id} (${user.email})` : 'null')
    if (error) console.log(`[Middleware] ${pathname} - Auth error:`, error.message)

    // Define protected routes
    const protectedRoutes = ['/', '/home', '/practice', '/prodsense', '/contact', '/mentorship', '/blog', '/community', '/admin']
    const isProtected = protectedRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))

    // Auth routes (where logged-in users shouldn't go)
    const authRoutes = ['/login', '/signup', '/admin/login']

    // Case A: Unauthenticated User trying to access Protected Route
    if (!user && isProtected) {
        console.log(`[Middleware] ${pathname} - REDIRECT to login (no user)`)
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirectedFrom', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Case B: Authenticated User trying to access Auth Pages
    if (user && authRoutes.includes(pathname)) {
        console.log(`[Middleware] ${pathname} - REDIRECT to home (already logged in)`)
        return NextResponse.redirect(new URL('/', request.url))
    }

    console.log(`[Middleware] ${pathname} - ALLOW (user: ${!!user})`)
    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - api routes
         * - public assets
         */
        '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}

