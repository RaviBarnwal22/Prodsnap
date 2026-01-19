import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname
    console.log(`[Middleware] ${pathname} - Start`)

    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    const cookies = request.cookies.getAll()
                    console.log(`[Middleware] ${pathname} - Cookies found:`, cookies.length)
                    return cookies
                },
                setAll(cookiesToSet) {
                    console.log(`[Middleware] ${pathname} - Setting cookies:`, cookiesToSet.length)
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refresh session if expired - this is critical
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
    return supabaseResponse
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

