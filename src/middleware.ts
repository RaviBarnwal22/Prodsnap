import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Public routes that don't require authentication
const publicRoutes = ['/', '/login', '/home', '/admin/login', '/auth/callback', '/auth/reset-password', '/forgot-password']

// Standard Supabase Middleware to refresh session
export async function middleware(request: NextRequest) {
    // 1. Create an initial response
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
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                    })
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    // 2. Refresh the session (this triggers setAll above if needed)
    const { data: { user } } = await supabase.auth.getUser()

    console.log(`[Middleware] ${request.method} ${request.nextUrl.pathname} | User: ${user?.id || 'none'}`)

    const pathname = request.nextUrl.pathname

    // 3. Define Protected Routes
    const protectedRoutes = ['/', '/home', '/practice', '/prodsense', '/contact', '/mentorship', '/blog', '/community']
    const isProtected = protectedRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))

    // 4. Handle Redirections
    // Case A: Unauthenticated User trying to access Protected Route -> Redirect to Login
    if (!user && isProtected) {
        const loginUrl = request.nextUrl.clone()
        loginUrl.pathname = '/login'
        // We must redirect, but we cannot lose the `response` cookies we might have just set in step 2
        // So we create a new Redirect response...
        const redirectResponse = NextResponse.redirect(loginUrl)

        // ...and we MUST copy over any cookies that were set on the original `response` object
        // This is the critical step for maintaining session integrity during redirects
        const cookiesToSet = response.cookies.getAll()
        cookiesToSet.forEach(cookie => redirectResponse.cookies.set(cookie))

        return redirectResponse
    }

    // Case B: Authenticated User trying to access Auth Pages (Login/Signup) -> Redirect to Home
    const authRoutes = ['/login', '/signup', '/admin/login']
    if (user && authRoutes.includes(pathname)) {
        const homeUrl = request.nextUrl.clone()
        homeUrl.pathname = '/'
        const redirectResponse = NextResponse.redirect(homeUrl)

        const cookiesToSet = response.cookies.getAll()
        cookiesToSet.forEach(cookie => redirectResponse.cookies.set(cookie))

        return redirectResponse
    }

    // Case C: Standard Request -> Return the response created in Step 1 (which includes any refreshed cookies)
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
         */
        '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
