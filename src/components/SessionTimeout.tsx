'use client'

import { useEffect, useRef, useState } from 'react'
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

    const logout = async () => {
        await supabase.auth.signOut()
        setShowWarning(false)
        router.push('/login')
        router.refresh()
    }

    const resetTimer = () => {
        // Clear existing timers
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        if (warningTimeoutRef.current) {
            clearTimeout(warningTimeoutRef.current)
        }

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
    }

    const handleActivity = () => {
        if (isLoggedIn) {
            resetTimer()
        }
    }

    const extendSession = () => {
        setShowWarning(false)
        resetTimer()
    }

    useEffect(() => {
        // Check if user is logged in
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setIsLoggedIn(!!user)

            if (user) {
                resetTimer()
            }
        }

        checkAuth()

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const loggedIn = !!session?.user
            setIsLoggedIn(loggedIn)

            if (loggedIn) {
                resetTimer()
            } else {
                // Clear timers when logged out
                if (timeoutRef.current) clearTimeout(timeoutRef.current)
                if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
                setShowWarning(false)
            }
        })

        // Activity event listeners
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']

        events.forEach(event => {
            document.addEventListener(event, handleActivity, true)
        })

        // Cleanup
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
            events.forEach(event => {
                document.removeEventListener(event, handleActivity, true)
            })
            subscription.unsubscribe()
        }
    }, [isLoggedIn])

    // Don't render anything if user is not logged in or no warning
    if (!isLoggedIn || !showWarning) {
        return null
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <svg
                            className="w-6 h-6 text-amber-600"
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
                        <h3 className="text-lg font-semibold text-gray-900">Session Timeout Warning</h3>
                        <p className="text-sm text-gray-500">You've been inactive for a while</p>
                    </div>
                </div>

                <p className="text-gray-700 mb-6">
                    You will be automatically logged out in <strong>1 minute</strong> due to inactivity.
                    Click "Stay Logged In" to continue your session.
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={extendSession}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200"
                    >
                        Stay Logged In
                    </button>
                    <button
                        onClick={logout}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-colors duration-200"
                    >
                        Log Out Now
                    </button>
                </div>
            </div>
        </div>
    )
}
