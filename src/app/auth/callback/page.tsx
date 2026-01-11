'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function AuthCallbackPage() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [errorMessage, setErrorMessage] = useState<string>('')
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()

    useEffect(() => {
        const handleCallback = async () => {
            // Get error from URL if present
            const urlError = searchParams.get('error_description') || searchParams.get('error')
            if (urlError) {
                setStatus('error')
                setErrorMessage(urlError)
                return
            }

            // Check for session
            const { data: { session }, error } = await supabase.auth.getSession()

            if (error) {
                setStatus('error')
                setErrorMessage(error.message)
                return
            }

            if (session) {
                setStatus('success')
                // Brief delay to show success message
                setTimeout(() => {
                    router.push('/practice')
                    router.refresh()
                }, 1500)
            } else {
                // No session, might be from email confirmation
                // Try to exchange the code from URL hash
                const hashParams = new URLSearchParams(window.location.hash.substring(1))
                const accessToken = hashParams.get('access_token')

                if (accessToken) {
                    setStatus('success')
                    setTimeout(() => {
                        router.push('/practice')
                        router.refresh()
                    }, 1500)
                } else {
                    setStatus('error')
                    setErrorMessage('Session could not be established. Please try logging in again.')
                }
            }
        }

        handleCallback()
    }, [router, supabase.auth, searchParams])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <h1 className="text-3xl font-bold">
                            Prod<span className="text-blue-600">snap</span>
                        </h1>
                    </Link>
                </div>

                {/* Card */}
                <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 text-center">
                    {status === 'loading' && (
                        <>
                            <Loader2 className="animate-spin mx-auto text-blue-600 mb-4" size={48} />
                            <h2 className="text-xl font-semibold mb-2">Signing you in...</h2>
                            <p className="text-gray-500 text-sm">Please wait a moment</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
                            <h2 className="text-xl font-semibold mb-2">Welcome!</h2>
                            <p className="text-gray-500 text-sm">Redirecting you to the app...</p>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-red-500 text-2xl">!</span>
                            </div>
                            <h2 className="text-xl font-semibold mb-2">Authentication Failed</h2>
                            <p className="text-gray-500 text-sm mb-6">{errorMessage}</p>
                            <Link
                                href="/login"
                                className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
                            >
                                Back to Login
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
