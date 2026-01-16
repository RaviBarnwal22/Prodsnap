import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Public routes that don't require authentication
const publicRoutes = ['/', '/login', '/home', '/admin/login', '/auth/callback', '/auth/reset-password', '/forgot-password']

export async function middleware(request: NextRequest) {
    // Temporary debugging: Bypass auth for all practice routes
    if (request.nextUrl.pathname.startsWith('/practice')) {
        return NextResponse.next()
    }

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

    // Check if the route is public
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

    // If not logged in and trying to access a protected route
    if (!user && !isPublicRoute) {
        const loginUrl = new URL('/login', request.url)
        const response = NextResponse.redirect(loginUrl)

        // Copy cookies from supabaseResponse (which might have refreshed tokens) to the redirect response
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
        '/((?!_next/static|_next/image|favicon.ico|api|practice|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
