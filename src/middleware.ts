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

    // 3. Define Protection Logic
    const authRoutes = ['/login', '/signup', '/admin/login']
    const isAuthRoute = authRoutes.some(route => pathname === route || pathname === route + '/')

    // Explicitly check for protected prefixes
    const isProtected = (pathname.startsWith('/admin') || pathname.startsWith('/feedback') || pathname.startsWith('/dashboard')) && !isAuthRoute

    // 4. Handle Protection (Only call getUser if needed)
    if (isProtected || isAuthRoute) {
        const { data: { user } } = await supabase.auth.getUser()

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
