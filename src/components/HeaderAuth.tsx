'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, User, Receipt, CreditCard, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { MobileMenu } from './MobileMenu'
import { SignInButton } from './SignInButton'

type Session =
    | { authenticated: false }
    | { authenticated: true; displayName: string; menuName: string; isAdmin: boolean }

const MENU_ITEMS = [
    { href: '/account', label: 'Profile', icon: User },
    { href: '/account/orders', label: 'My Orders', icon: Receipt },
    { href: '/account/subscription', label: 'Subscription', icon: CreditCard },
]

/** Click the name to open account links. Closes on outside click, Escape, or navigation. */
function AccountMenu({ displayName }: { displayName: string }) {
    const [open, setOpen] = useState(false)
    const wrapRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!open) return

        const onPointerDown = (e: MouseEvent | TouchEvent) => {
            if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
        }
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false)
        }

        document.addEventListener('mousedown', onPointerDown)
        document.addEventListener('touchstart', onPointerDown)
        document.addEventListener('keydown', onKeyDown)
        return () => {
            document.removeEventListener('mousedown', onPointerDown)
            document.removeEventListener('touchstart', onPointerDown)
            document.removeEventListener('keydown', onKeyDown)
        }
    }, [open])

    return (
        <div className="relative" ref={wrapRef}>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                aria-expanded={open}
                aria-haspopup="menu"
                className="flex items-center gap-1.5 text-sm font-medium px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
                <span className="max-w-[10rem] truncate">{displayName}</span>
                <ChevronDown
                    size={15}
                    className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                />
            </button>

            {open && (
                <div
                    role="menu"
                    className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl py-1.5 z-50"
                >
                    {MENU_ITEMS.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            role="menuitem"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <Icon size={16} className="text-gray-400" />
                            {label}
                        </Link>
                    ))}
                    <div className="my-1.5 border-t border-gray-100 dark:border-gray-800" />
                    <a
                        href="/auth/signout"
                        role="menuitem"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-red-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <LogOut size={16} />
                        Sign Out
                    </a>
                </div>
            )}
        </div>
    )
}

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
                        <AccountMenu displayName={session.displayName} />
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
