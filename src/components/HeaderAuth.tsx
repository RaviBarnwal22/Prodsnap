'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { MobileMenu } from './MobileMenu'
import { SignInButton } from './SignInButton'

type Session =
    | { authenticated: false }
    | { authenticated: true; displayName: string; menuName: string; isAdmin: boolean }

/**
 * The header's auth-dependent slice, resolved in the browser.
 *
 * It used to be server-rendered, which meant every page carrying a <Header />
 * read cookies and therefore could not be statically generated — and the pages
 * that WERE static (the 28 SEO detail pages) showed a signed-out header to
 * signed-in users. Resolving it client-side lets content pages be prerendered
 * and served from the CDN while still showing the correct account state.
 *
 * Nothing here is SEO-relevant: the nav links stay server-rendered in
 * <Navigation />, so crawlers still see the internal linking.
 */
export function HeaderAuth() {
    const [session, setSession] = useState<Session | null>(null)

    useEffect(() => {
        let cancelled = false

        const load = async () => {
            try {
                const res = await fetch('/api/auth/me', { cache: 'no-store' })
                if (!res.ok) throw new Error(`status ${res.status}`)
                const data: Session = await res.json()
                if (!cancelled) setSession(data)
            } catch {
                // Treat an unreachable session endpoint as signed out rather than
                // leaving the header stuck in its loading state forever.
                if (!cancelled) setSession({ authenticated: false })
            }
        }

        load()

        // Keep the header in step with sign-in / sign-out, which no longer
        // trigger a server re-render of this component.
        const supabase = createClient()
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') load()
        })

        return () => {
            cancelled = true
            subscription.unsubscribe()
        }
    }, [])

    // Reserve the same footprint as the resolved state so the header does not
    // shift once the session arrives (layout shift is a Core Web Vitals factor).
    if (session === null) {
        return (
            <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-4">
                    <div
                        className="w-[86px] h-9 rounded-md bg-gray-100 dark:bg-gray-800 animate-pulse"
                        aria-hidden="true"
                    />
                </div>
                <MobileMenu isLoggedIn={false} />
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-4">
                {session.authenticated ? (
                    <div className="flex items-center gap-4">
                        {session.isAdmin && (
                            <Link
                                href="/admin"
                                className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors flex items-center gap-1.5"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                Admin Panel
                            </Link>
                        )}
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">{session.displayName}</span>
                            <a
                                href="/auth/signout"
                                className="text-xs text-gray-500 hover:text-red-500 transition"
                            >
                                Sign Out
                            </a>
                        </div>
                    </div>
                ) : (
                    <SignInButton className="bg-violet-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-violet-700 transition" />
                )}
            </div>
            <MobileMenu
                isLoggedIn={session.authenticated}
                isAdmin={session.authenticated ? session.isAdmin : false}
                userName={session.authenticated ? session.menuName : undefined}
            />
        </div>
    )
}
