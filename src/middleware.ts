import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Public routes that don't require authentication
const publicRoutes = ['/', '/login', '/home', '/admin/login', '/auth/callback', '/auth/reset-password', '/forgot-password']

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    console.log(`[Middleware] ${request.method} ${request.nextUrl.pathname}`)
    console.log(`[Middleware] User ID: ${user?.id || 'none'}`)

    const pathname = request.nextUrl.pathname

    // 1. Strict Route Protection
    // Redirect unauthenticated users to /login for protected routes
    const protectedRoutes = ['/', '/home', '/practice', '/prodsense', '/contact', '/mentorship', '/blog', '/community']
    const isProtected = protectedRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))

    if (!user && isProtected) {
        console.log(`[Middleware] Redirecting unauthenticated user from ${pathname} to /login`)
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        // Redirect completely, but ensure cookies are passed along
        const response = NextResponse.redirect(url)
        // ESSENTIAL: Copy any updated cookies (e.g. session refresh) to the redirect response
        const cookiesToSet = supabaseResponse.cookies.getAll()
        cookiesToSet.forEach(cookie => response.cookies.set(cookie))
        return response
    }

    // 2. Admin Route Protection
    if (!user && pathname.startsWith('/admin') && pathname !== '/admin/login') {
        const url = request.nextUrl.clone()
        url.pathname = '/admin/login'
        const response = NextResponse.redirect(url)
        const cookiesToSet = supabaseResponse.cookies.getAll()
        cookiesToSet.forEach(cookie => response.cookies.set(cookie))
        return response
    }

    // 3. Authenticated User Redirects
    // If logged in and trying to access login page, redirect to home
    if (user && pathname === '/login') {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        const response = NextResponse.redirect(url)
        const cookiesToSet = supabaseResponse.cookies.getAll()
        cookiesToSet.forEach(cookie => response.cookies.set(cookie))
        return response
    }

    // If logged in and trying to access admin login, redirect to admin
    if (user && pathname === '/admin/login') {
        const url = request.nextUrl.clone()
        url.pathname = '/admin'
        const response = NextResponse.redirect(url)
        const cookiesToSet = supabaseResponse.cookies.getAll()
        cookiesToSet.forEach(cookie => response.cookies.set(cookie))
        return response
    }

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
         */
        '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
