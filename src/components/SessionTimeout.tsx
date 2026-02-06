'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const INACTIVITY_TIMEOUT = 60 * 60 * 1000 // 1 hour in milliseconds
const WARNING_TIME = 60 * 1000 // Show warning 1 minute before logout

export default function SessionTimeout() {
    const router = useRouter()
    const supabase = createClient()
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const [showWarning, setShowWarning] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    const logout = useCallback(async () => {
        // Clear timers immediately
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)

        await supabase.auth.signOut()
        setShowWarning(false)
        setIsLoggedIn(false)
        router.push('/login')
        router.refresh()
    }, [supabase, router])

    const resetTimer = useCallback(() => {
        // Clear existing timers
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)

        // Hide warning if it's showing
        setShowWarning(false)

        // Set warning timer (59 minutes)
        warningTimeoutRef.current = setTimeout(() => {
            setShowWarning(true)
        }, INACTIVITY_TIMEOUT - WARNING_TIME)

        // Set logout timer (60 minutes)
        timeoutRef.current = setTimeout(() => {
            logout()
        }, INACTIVITY_TIMEOUT)
    }, [logout])

    const handleActivity = useCallback(() => {
        if (isLoggedIn) {
            resetTimer()
        }
    }, [isLoggedIn, resetTimer])

    useEffect(() => {
        let lastActivity = Date.now()
        const activityThrottle = 10000 // 10 seconds

        const throttledActivity = () => {
            const now = Date.now()
            if (now - lastActivity > activityThrottle) {
                lastActivity = now
                handleActivity()
            }
        }

        // Initial auth check
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            const hasUser = !!session?.user
            setIsLoggedIn(hasUser)
            if (hasUser) resetTimer()
        }
        checkAuth()

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            const hasUser = !!session?.user
            setIsLoggedIn(hasUser)

            if (hasUser) {
                resetTimer()
            } else if (event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
                // Clear timers and redirect if definitively logged out
                if (timeoutRef.current) clearTimeout(timeoutRef.current)
                if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
                setShowWarning(false)

                if (event === 'SIGNED_OUT') {
                    router.push('/login')
                    router.refresh()
                }
            }
        })

        // Activity event listeners
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']

        events.forEach(event => {
            document.addEventListener(event, throttledActivity, { passive: true, capture: true })
        })

        // Cleanup
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
            events.forEach(event => {
                document.removeEventListener(event, throttledActivity, true)
            })
            subscription.unsubscribe()
        }
    }, [supabase, handleActivity, resetTimer]) // Stable dependencies


    const extendSession = () => {
        resetTimer()
    }

    // Don't render anything if user is not logged in or no warning
    if (!isLoggedIn || !showWarning) {
        return null
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 animate-pulse">
                        <svg
                            className="w-8 h-8 text-amber-600 dark:text-amber-400"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Session Security</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Auto-logout in 60 seconds</p>
                    </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                    We've detected some inactivity. For your security, you'll be signed out soon.
                    Would you like to continue your session?
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={extendSession}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/20"
                    >
                        Yes, Stay Signed In
                    </button>
                    <button
                        onClick={logout}
                        className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold py-3.5 rounded-xl transition-all duration-300"
                    >
                        Sign Out Now
                    </button>
                </div>
            </div>
        </div>
    )
}

