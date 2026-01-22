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
                    console.log('[MW] setAll() called - setting', cookiesToSet.length, 'cookies')
                    cookiesToSet.forEach(({ name, value }) => {
                        console.log('[MW] Setting cookie on request:', name, '(length:', value.length, ')')
                        request.cookies.set(name, value)
                    })
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) => {
                        console.log('[MW] Setting cookie on response:', name, '(length:', value.length, ')')
                        // Force specific cookie attributes for Vercel
                        const cookieOptions = {
                            ...options,
                            path: '/',
                            sameSite: 'lax' as const,
                            secure: process.env.NODE_ENV === 'production',
                            httpOnly: true,
                        }
                        response.cookies.set(name, value, cookieOptions)
                    })
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
    const isAuthRoute = authRoutes.includes(pathname)

    // Define protected routes
    const protectedRoutes = ['/', '/home', '/practice', '/prodsense', '/contact', '/mentorship', '/blog', '/community', '/admin']
    // A route is protected if it's in the list and NOT an auth route
    const isProtected = protectedRoutes.some(route => pathname === route || pathname.startsWith(route + '/')) && !isAuthRoute

    // Case A: Unauthenticated User trying to access Protected Route
    if (!user && isProtected) {
        console.log('[MW] 🔒 PROTECTED ROUTE + NO USER → Redirecting to login')
        // If it's an admin route, redirect to admin login
        const redirectPath = pathname.startsWith('/admin') ? '/admin/login' : '/login'
        const loginUrl = new URL(redirectPath, request.url)
        loginUrl.searchParams.set('redirectedFrom', pathname)
        console.log('[MW] Redirect URL:', loginUrl.toString())
        console.log('┌─────────────────────────────────────┐')
        return NextResponse.redirect(loginUrl)
    }

    // Case B: Authenticated User trying to access Auth Pages
    if (user && authRoutes.includes(pathname)) {
        console.log('[MW] ✅ AUTHENTICATED + AUTH PAGE → Redirecting to home')
        console.log('┌─────────────────────────────────────┐')
        return NextResponse.redirect(new URL('/', request.url))
    }

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

