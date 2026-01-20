import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname

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

    // Refresh the user's session
    const { data: { user } } = await supabase.auth.getUser()

    // Define protected routes
    const protectedRoutes = ['/', '/home', '/practice', '/prodsense', '/contact', '/mentorship', '/blog', '/community', '/admin']
    const isProtected = protectedRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))

    // Auth routes (where logged-in users shouldn't go)
    const authRoutes = ['/login', '/signup', '/admin/login']

    // Case A: Unauthenticated User trying to access Protected Route
    if (!user && isProtected) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirectedFrom', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Case B: Authenticated User trying to access Auth Pages
    if (user && authRoutes.includes(pathname)) {
        return NextResponse.redirect(new URL('/', request.url))
    }

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

