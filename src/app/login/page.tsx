'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, User, X, RefreshCw, Sparkles, Zap, Target, TrendingUp, GraduationCap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

type AuthMode = 'signin' | 'signup' | 'forgot'
type VerificationState = 'none' | 'pending' | 'checking'

export default function LoginPage() {
    const [mode, setMode] = useState<AuthMode>('signin')
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [verificationState, setVerificationState] = useState<VerificationState>('none')
    const [verificationEmail, setVerificationEmail] = useState("")
    const [resendCountdown, setResendCountdown] = useState(0)
    const [focusedField, setFocusedField] = useState<string | null>(null)
    const supabase = createClient()
    const router = useRouter()

    // Countdown timer for resend
    useEffect(() => {
        if (resendCountdown > 0) {
            const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [resendCountdown])

    const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")
        setMessage("")

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setIsLoading(false)
            setError(error.message)
        } else {
            setMessage("Login successful! Taking you to your dashboard...")
            // Keep loading state true while redirecting
            // Use window.location.href to force a hard refresh
            window.location.href = '/'
        }
    }

    // ... (rest of the file)

    <button
        disabled={isLoading}
        className={`w-full bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white rounded-xl py-4 font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-80 group ${message ? 'cursor-wait' : ''}`}
    >
        {isLoading ? (
            <>
                <Loader2 className="animate-spin" size={20} />
                {message ? "Redirecting..." : "Signing In..."}
            </>
        ) : (
            <>Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
        )}
    </button>
                            </form >
                        )
}

{/* Sign Up Form */ }
{
    mode === 'signup' && !message && (
        <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">First Name</label>
                    <div className={`relative transition-all duration-300 ${focusedField === 'firstName' ? 'scale-[1.02]' : ''}`}>
                        <User className={`absolute left-3 top-3.5 transition-colors ${focusedField === 'firstName' ? 'text-purple-500' : 'text-gray-400'}`} size={16} />
                        <input
                            type="text"
                            name="firstName"
                            required
                            onFocus={() => setFocusedField('firstName')}
                            onBlur={() => setFocusedField(null)}
                            className="w-full border-2 rounded-xl pl-10 pr-3 py-3 bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium text-sm"
                            placeholder="John"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Last Name</label>
                    <div className={`relative transition-all duration-300 ${focusedField === 'lastName' ? 'scale-[1.02]' : ''}`}>
                        <input
                            type="text"
                            name="lastName"
                            required
                            onFocus={() => setFocusedField('lastName')}
                            onBlur={() => setFocusedField(null)}
                            className="w-full border-2 rounded-xl px-4 py-3 bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium text-sm"
                            placeholder="Doe"
                        />
                    </div>
                </div>
            </div>
            <div>
                <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Email</label>
                <div className={`relative transition-all duration-300 ${focusedField === 'signupEmail' ? 'scale-[1.02]' : ''}`}>
                    <Mail className={`absolute left-4 top-3.5 transition-colors ${focusedField === 'signupEmail' ? 'text-purple-500' : 'text-gray-400'}`} size={18} />
                    <input
                        type="email"
                        name="email"
                        required
                        onFocus={() => setFocusedField('signupEmail')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full border-2 rounded-xl pl-12 pr-4 py-3 bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                        placeholder="you@example.com"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Password</label>
                <div className={`relative transition-all duration-300 ${focusedField === 'signupPassword' ? 'scale-[1.02]' : ''}`}>
                    <Lock className={`absolute left-4 top-3.5 transition-colors ${focusedField === 'signupPassword' ? 'text-purple-500' : 'text-gray-400'}`} size={18} />
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        required
                        minLength={6}
                        onFocus={() => setFocusedField('signupPassword')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full border-2 rounded-xl pl-12 pr-12 py-3 bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                        placeholder="Min 6 characters"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-3.5 text-gray-400 hover:text-purple-500 transition"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>
            <button
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white rounded-xl py-4 font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 group"
            >
                {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                ) : (
                    <>Create Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                )}
            </button>
            <p className="text-xs text-gray-500 text-center">
                By signing up, you agree to our Terms of Service and Privacy Policy.
            </p>
        </form>
    )
}

{/* Forgot Password Form */ }
{
    mode === 'forgot' && !message && (
        <form onSubmit={handleForgotPassword} className="space-y-5">
            <div>
                <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Email</label>
                <div className={`relative transition-all duration-300 ${focusedField === 'forgotEmail' ? 'scale-[1.02]' : ''}`}>
                    <Mail className={`absolute left-4 top-3.5 transition-colors ${focusedField === 'forgotEmail' ? 'text-purple-500' : 'text-gray-400'}`} size={18} />
                    <input
                        type="email"
                        name="email"
                        required
                        onFocus={() => setFocusedField('forgotEmail')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full border-2 rounded-xl pl-12 pr-4 py-3 bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                        placeholder="you@example.com"
                    />
                </div>
            </div>
            <button
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white rounded-xl py-4 font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 group"
            >
                {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                ) : (
                    <>Send Reset Link <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                )}
            </button>
            <button
                type="button"
                onClick={() => { setMode('signin'); setError(''); setMessage('') }}
                className="w-full text-sm text-gray-500 hover:text-purple-600 py-2 font-semibold transition"
            >
                ← Back to Sign In
            </button>
        </form>
    )
}

{/* Success state */ }
{
    message && (
        <button
            onClick={() => { setMode('signin'); setMessage(''); setError('') }}
            className="w-full text-sm text-purple-600 hover:text-purple-700 py-2 font-bold"
        >
            ← Back to Sign In
        </button>
    )
}
                    </div >

    {/* Footer */ }
    < p className = "text-center text-sm text-gray-400 mt-6" >
                        © 2026 Prodsnap.All rights reserved.
                    </p >

    {/* Admin Login Link */ }
    < div className = "text-center mt-4" >
        <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 transition-colors"
        >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Admin Login
        </Link>
                    </div >
                </div >
            </div >

    {/* Custom CSS for animations */ }
    < style jsx > {`
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.3s ease-in-out;
                }
            `}</style >
        </div >
    )
}
