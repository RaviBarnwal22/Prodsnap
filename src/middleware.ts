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

    // Get current user
    const { data: { user }, error } = await supabase.auth.getUser()

    console.log(`[Middleware] ${request.method} ${request.nextUrl.pathname}`)
    console.log(`[Middleware] Cookies present: ${request.cookies.getAll().map(c => c.name).join(', ')}`)
    console.log(`[Middleware] User ID: ${user?.id || 'none'}`)
    if (error) console.log(`[Middleware] Auth Error: ${error.message}`)

    const pathname = request.nextUrl.pathname

    // Only protect /admin routes strictly on the server
    // All other routes use client-side auth to avoid server/client cookie mismatch issues
    // EXCEPTION: Force redirect from /, /home, /practice, /prodsense, /contact, /mentorship, /blog, /community to /login
    const protectedRoutes = ['/', '/home', '/practice', '/prodsense', '/contact', '/mentorship', '/blog', '/community']
    const isProtected = protectedRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))

    if (!user && isProtected) {
        console.log(`[Middleware] Redirecting unauthenticated user from ${pathname} to /login`)
        const loginUrl = new URL('/login', request.url)
        const response = NextResponse.redirect(loginUrl)

        // Copy cookies from supabaseResponse
        const cookiesToSet = supabaseResponse.cookies.getAll()
        cookiesToSet.forEach(cookie => response.cookies.set(cookie))

        return response
    }

    if (!user && pathname.startsWith('/admin') && pathname !== '/admin/login') {
        const loginUrl = new URL('/admin/login', request.url)
        const response = NextResponse.redirect(loginUrl)

        // Copy cookies from supabaseResponse
        const cookiesToSet = supabaseResponse.cookies.getAll()
        cookiesToSet.forEach(cookie => response.cookies.set(cookie))

        return response
    }

    // If logged in and trying to access login page, redirect to home
    if (user && pathname === '/login') {
        const homeUrl = new URL('/', request.url)
        const response = NextResponse.redirect(homeUrl)

        // Copy cookies
        const cookiesToSet = supabaseResponse.cookies.getAll()
        cookiesToSet.forEach(cookie => response.cookies.set(cookie))

        return response
    }

    // If logged in and trying to access admin login, redirect to admin
    if (user && pathname === '/admin/login') {
        const adminUrl = new URL('/admin', request.url)
        const response = NextResponse.redirect(adminUrl)

        // Copy cookies
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
