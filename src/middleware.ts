import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname
    const timestamp = new Date().toISOString()

    console.log('┌─────────────────────────────────────┐')
    console.log(`│ [MIDDLEWARE] ${pathname}`)
    console.log(`│ Time: ${timestamp}`)
    console.log('└─────────────────────────────────────┘')

    // Log incoming cookies
    const incomingCookies = request.cookies.getAll()
    console.log('[MW] Incoming cookies:', incomingCookies.length)
    const incomingAuthCookies = incomingCookies.filter(c => c.name.includes('auth'))
    if (incomingAuthCookies.length > 0) {
        console.log('[MW] Incoming auth cookies:', incomingAuthCookies.map(c => ({
            name: c.name,
            hasValue: !!c.value,
            valueLength: c.value?.length || 0
        })))
    } else {
        console.log('[MW] ⚠️  NO AUTH COOKIES IN REQUEST')
    }

    // Create a response
    let response = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    const cookies = request.cookies.getAll()
                    console.log('[MW] getAll() called - returning', cookies.length, 'cookies')
                    return cookies
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    console.log('[MW] Calling supabase.auth.getUser()...')
    // Refresh the user's session
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
        console.log('[MW] ❌ getUser() error:', error.message)
    }

    if (user) {
        console.log('[MW] ✅ USER FOUND:', user.id, '(' + user.email + ')')
    } else {
        console.log('[MW] ❌ NO USER - Session not found')
    }

    // Auth routes (where logged-in users shouldn't go)
    const authRoutes = ['/login', '/signup', '/admin/login']
    const isAuthRoute = authRoutes.some(route => pathname === route || pathname === route + '/')

    // List of routes that are explicitly PUBLIC (No login required)
    const publicRoutes = ['/', '/about', '/practice', '/mentorship', '/community', '/contact', '/blog', '/prodsense', '/privacy', '/terms']
    const isPublic = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))

    // A route is protected IF it's not public AND not an auth route
    // OR if it's explicitly an admin/feedback route
    const isProtected = (pathname.startsWith('/admin') || pathname.startsWith('/feedback')) && !isAuthRoute

    console.log(`[MW] Route: ${pathname} | isPublic: ${isPublic} | isProtected: ${isProtected}`)

    // Case A: Unauthenticated User trying to access Protected Route
    if (!user && isProtected) {
        console.log('[MW] 🔒 ACCESS DENIED → Redirecting to login')
        const redirectPath = pathname.startsWith('/admin') ? '/admin/login' : '/login'
        const loginUrl = new URL(redirectPath, request.url)
        loginUrl.searchParams.set('redirectedFrom', pathname) // Restore consistency
        return NextResponse.redirect(loginUrl)
    }

    // Case B: Authenticated User trying to access Auth Pages (Login/Signup)
    if (user && isAuthRoute) {
        console.log('[MW] ✅ ALREADY AUTHENTICATED → Redirecting to home')
        return NextResponse.redirect(new URL('/', request.url))
    }

    // Otherwise, allow

    console.log('[MW] ✅ ALLOWING REQUEST')

    // Log outgoing cookies
    const outgoingCookies = response.cookies.getAll()
    console.log('[MW] Outgoing cookies:', outgoingCookies.length)
    const outgoingAuthCookies = outgoingCookies.filter(c => c.name.includes('auth'))
    if (outgoingAuthCookies.length > 0) {
        console.log('[MW] Outgoing auth cookies:', outgoingAuthCookies.map(c => ({
            name: c.name,
            hasValue: !!c.value,
            valueLength: c.value?.length || 0
        })))
    }
    console.log('└─────────────────────────────────────┘')

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

