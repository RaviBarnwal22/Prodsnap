'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function AdminLoginPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        // Check if it's the admin email
        if (email !== 'ravibarnwal89@gmail.com') {
            setError("Access denied. Admin credentials required.")
            setIsLoading(false)
            return
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, redirectedFrom: '/admin' }),
                credentials: 'include',
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'Sign in failed')
                setIsLoading(false)
                return
            }

            // Redirect to admin dashboard
            window.location.href = '/admin'
        } catch (error: any) {
            setError(error.message || 'Sign in failed')
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 px-4">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3 justify-center">
                        <Image src="/logo.png" alt="Prodsnap" width={52} height={52} className="rounded-xl shadow-lg border-2 border-white/10" />
                        <h1 className="text-3xl font-bold text-white">
                            Prod<span className="text-blue-400">snap</span>
                        </h1>
                    </Link>
                </div>

                {/* Admin Badge */}
                <div className="flex justify-center mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 text-blue-300 text-sm font-bold border border-blue-500/30">
                        <ShieldCheck size={18} />
                        Admin Portal
                    </div>
                </div>

                {/* Login Card */}
                <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
                    <h2 className="text-2xl font-bold text-white text-center mb-2">Admin Sign In</h2>
                    <p className="text-gray-400 text-center mb-8 text-sm">
                        Restricted access for administrators only
                    </p>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/30 text-red-300 text-sm p-4 rounded-xl mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSignIn} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                    placeholder="admin@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-500/25"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck size={20} />
                                    Access Dashboard
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Back to main site */}
                <div className="text-center mt-6">
                    <Link href="/login" className="text-gray-400 hover:text-white text-sm transition">
                        ← Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    )
}
