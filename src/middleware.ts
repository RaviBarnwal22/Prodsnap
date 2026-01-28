import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // 1. Create a response
    let response = NextResponse.next({
        request,
    })

    // 2. Initialize Supabase Client
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

    // 3. Get User (This is the heavy part, kept only for protection logic)
    const { data: { user } } = await supabase.auth.getUser()

    // 4. Protection Logic
    const authRoutes = ['/login', '/signup', '/admin/login']
    const isAuthRoute = authRoutes.some(route => pathname === route || pathname === route + '/')

    // List of routes that are explicitly PUBLIC (No login required)
    const publicRoutes = ['/', '/about', '/practice', '/mentorship', '/community', '/contact', '/blog', '/prodsense', '/privacy', '/terms']
    const isPublic = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))

    // A route is protected IF it's not public AND not an auth route
    // OR if it's explicitly an admin/feedback route
    const isProtected = (pathname.startsWith('/admin') || pathname.startsWith('/feedback')) && !isAuthRoute

    // Case A: Unauthenticated User trying to access Protected Route
    if (!user && isProtected) {
        const redirectPath = pathname.startsWith('/admin') ? '/admin/login' : '/login'
        const loginUrl = new URL(redirectPath, request.url)
        loginUrl.searchParams.set('redirectedFrom', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Case B: Authenticated User trying to access Auth Pages (Login/Signup)
    if (user && isAuthRoute) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // Otherwise, allow
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
