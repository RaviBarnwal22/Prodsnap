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
    const [showLongLoading, setShowLongLoading] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    // Loading timer
    useEffect(() => {
        let timer: NodeJS.Timeout
        if (isLoading) {
            timer = setTimeout(() => {
                setShowLongLoading(true)
            }, 2000)
        } else {
            setShowLongLoading(false)
        }
        return () => clearTimeout(timer)
    }, [isLoading])

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

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            console.log('[Login] Error:', error.message)
            setIsLoading(false)
            setError(error.message)
        } else {
            console.log('[Login] Success! User:', data.user?.id, 'Session:', !!data.session)
            console.log('[Login] Cookies:', document.cookie)
            setMessage("Login successful! Taking you to your dashboard...")
            const params = new URLSearchParams(window.location.search)
            const redirectedFrom = params.get('redirectedFrom')
            // Hard redirect to ensure proper cookie sync
            window.location.href = redirectedFrom || '/'
        }
    }

    const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")
        setMessage("")

        const formData = new FormData(e.currentTarget)
        const firstName = formData.get("firstName") as string
        const lastName = formData.get("lastName") as string
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    full_name: `${firstName} ${lastName}`,
                }
            }
        })

        setIsLoading(false)

        if (error) {
            if (error.message.toLowerCase().includes('already registered') ||
                error.message.toLowerCase().includes('already exists') ||
                error.message.toLowerCase().includes('user already')) {
                setError("An account with this email already exists. Please sign in instead.")
            } else {
                setError(error.message)
            }
        } else if (data.user && data.user.identities && data.user.identities.length === 0) {
            setError("An account with this email already exists. Please sign in instead.")
        } else {
            setVerificationEmail(email)
            setVerificationState('pending')
            setResendCountdown(50)
        }
    }

    const handleResendVerification = async () => {
        if (resendCountdown > 0) return

        setIsLoading(true)
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: verificationEmail,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            }
        })
        setIsLoading(false)

        if (error) {
            setError(error.message)
        } else {
            setResendCountdown(50)
        }
    }

    const handleCheckVerification = async () => {
        setVerificationState('checking')

        const { data } = await supabase.auth.getSession()

        if (data.session) {
            router.push('/')
            router.refresh()
        } else {
            setVerificationState('pending')
            setError("Email not verified yet. Please check your inbox and click the verification link.")
            setTimeout(() => setError(""), 5000)
        }
    }

    const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")
        setMessage("")

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
        })

        setIsLoading(false)

        if (error) {
            setError(error.message)
        } else {
            setMessage("Check your email for a password reset link!")
        }
    }

    const closeVerificationModal = () => {
        setVerificationState('none')
        setVerificationEmail("")
        setMode('signin')
    }

    const features = [
        { icon: <Sparkles size={20} />, text: "AI-Powered Feedback", color: "from-yellow-400 to-orange-500" },
        { icon: <GraduationCap size={20} />, text: "IIM(Gold Medalist) Grad Mentorship", color: "from-red-400 to-pink-500" },
        { icon: <Target size={20} />, text: "Diverse Case Studies", color: "from-green-400 to-emerald-500" },
        { icon: <Zap size={20} />, text: "Real-Time Practice", color: "from-blue-400 to-cyan-500" },
        { icon: <TrendingUp size={20} />, text: "Track Your Growth", color: "from-purple-400 to-pink-500" },
    ]

    // Feature badges for the side panel
    // Long loading state overlay
    if (showLongLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
                        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-600 animate-pulse" size={24} />
                    </div>
                    <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 mb-2">
                        Securing your session...
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        Almost there! Just one moment.
                    </p>
                </div>
            </div>
        )
    }

    // Verification Modal
    if (verificationState !== 'none') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 px-4 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/30 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>

                <div className="w-full max-w-md relative z-10">
                    <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 text-center relative">
                        <button
                            onClick={closeVerificationModal}
                            className="absolute top-4 right-4 text-white/60 hover:text-white transition"
                        >
                            <X size={24} />
                        </button>

                        <div className="w-24 h-24 bg-gradient-to-br from-white/20 to-white/5 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce" style={{ animationDuration: '2s' }}>
                            <Mail className="text-white" size={48} />
                        </div>

                        <h2 className="text-3xl font-bold mb-2 text-white">Verify your email</h2>

                        <p className="text-white/70 mb-2">
                            We&apos;ve sent a verification link to
                        </p>
                        <p className="font-semibold text-white mb-4 bg-white/10 px-4 py-2 rounded-lg inline-block">
                            {verificationEmail}
                        </p>

                        <p className="text-white/60 text-sm mb-6">
                            Please check your inbox and click the link to activate your account.
                        </p>

                        {error && (
                            <div className="bg-red-500/20 border border-red-500/30 text-red-200 text-sm p-3 rounded-lg mb-4">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleCheckVerification}
                            disabled={verificationState === 'checking'}
                            className="w-full bg-white text-purple-600 rounded-xl py-3 font-bold hover:bg-white/90 transition flex items-center justify-center gap-2 disabled:opacity-50 mb-3 shadow-lg"
                        >
                            {verificationState === 'checking' ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                "I've Verified ✓"
                            )}
                        </button>

                        <div className="mb-4">
                            {resendCountdown > 0 ? (
                                <p className="text-white/60 text-sm">
                                    Resend available in <span className="font-semibold text-yellow-300">{resendCountdown}s</span>
                                </p>
                            ) : (
                                <button
                                    onClick={handleResendVerification}
                                    disabled={isLoading}
                                    className="text-white/80 hover:text-white text-sm font-medium flex items-center justify-center gap-1 mx-auto"
                                >
                                    {isLoading ? (
                                        <Loader2 className="animate-spin" size={16} />
                                    ) : (
                                        <>
                                            <RefreshCw size={14} />
                                            Resend verification email
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Colorful Branding Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/30 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute top-20 right-20 w-16 h-16 border-4 border-white/20 rounded-xl rotate-12 animate-float"></div>
                    <div className="absolute bottom-32 right-32 w-24 h-24 border-4 border-white/10 rounded-full animate-float" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute top-1/3 left-16 w-12 h-12 bg-white/10 rounded-lg rotate-45 animate-float" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute bottom-20 left-20 w-20 h-20 border-4 border-white/15 rounded-xl -rotate-12 animate-float" style={{ animationDelay: '1.5s' }}></div>
                </div>

                <div className="relative z-10 flex flex-col justify-center px-12 py-20 text-white">
                    <Link href="/" className="mb-12 flex items-center gap-4">
                        <Image src="/logo.png" alt="Prodsnap" width={56} height={56} className="rounded-2xl shadow-lg border-2 border-white/20" />
                        <h1 className="text-4xl font-black">
                            Prod<span className="text-yellow-300">snap</span>
                        </h1>
                    </Link>

                    <h2 className="text-5xl font-black leading-tight mb-6">
                        Crack Your PM Interview<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-cyan-300">
                            Like a Pro
                        </span>
                    </h2>

                    <p className="text-xl text-white/80 mb-12 leading-relaxed">
                        Join thousands of aspiring PMs practicing with AI-powered feedback
                        and expert-curated case studies.
                    </p>

                    <div className="space-y-4">
                        {features.map((feature, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/20 transition-all cursor-default group"
                                style={{ animationDelay: `${i * 0.1}s` }}
                            >
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                    {feature.icon}
                                </div>
                                <span className="font-semibold text-lg">{feature.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-white dark:bg-gray-950 px-6 py-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
                        backgroundSize: '40px 40px'
                    }}></div>
                </div>

                <div className="w-full max-w-md relative z-10">
                    <div className="text-center mb-8 lg:hidden">
                        <Link href="/" className="inline-flex items-center gap-3 justify-center">
                            <Image src="/logo.png" alt="Prodsnap" width={48} height={48} className="rounded-xl shadow-lg" />
                            <h1 className="text-3xl font-bold">
                                Prod<span className="text-purple-600">snap</span>
                            </h1>
                        </Link>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2">
                            {mode === 'signin' && '👋 Welcome back!'}
                            {mode === 'signup' && '🚀 Get started'}
                            {mode === 'forgot' && '🔑 Reset password'}
                        </h2>
                        <p className="text-gray-500">
                            {mode === 'signin' && 'Sign in to continue your practice'}
                            {mode === 'signup' && 'Create your free account today'}
                            {mode === 'forgot' && "We'll send you a reset link"}
                        </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl">
                        {mode !== 'forgot' && (
                            <div className="flex mb-6 bg-gray-200 dark:bg-gray-800 rounded-xl p-1.5">
                                <button
                                    onClick={() => { setMode('signin'); setError(''); setMessage('') }}
                                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${mode === 'signin'
                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => { setMode('signup'); setError(''); setMessage('') }}
                                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${mode === 'signup'
                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Sign Up
                                </button>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-4 rounded-xl mb-4 text-center border border-red-200 dark:border-red-800 animate-shake">
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm p-4 rounded-xl mb-4 text-center font-medium border border-green-200 dark:border-green-800">
                                ✓ {message}
                            </div>
                        )}

                        {mode === 'signin' && !message && (
                            <form onSubmit={handleSignIn} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Email</label>
                                    <div className={`relative transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.02]' : ''}`}>
                                        <Mail className={`absolute left-4 top-3.5 transition-colors ${focusedField === 'email' ? 'text-purple-500' : 'text-gray-400'}`} size={18} />
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            onFocus={() => setFocusedField('email')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full border-2 rounded-xl pl-12 pr-4 py-3 bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Password</label>
                                    <div className={`relative transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.02]' : ''}`}>
                                        <Lock className={`absolute left-4 top-3.5 transition-colors ${focusedField === 'password' ? 'text-purple-500' : 'text-gray-400'}`} size={18} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            required
                                            onFocus={() => setFocusedField('password')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full border-2 rounded-xl pl-12 pr-12 py-3 bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                                            placeholder="••••••••"
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
                                <div className="text-right">
                                    <button
                                        type="button"
                                        onClick={() => { setMode('forgot'); setError(''); setMessage('') }}
                                        className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
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
                            </form>
                        )}

                        {mode === 'signup' && !message && (
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
                        )}

                        {mode === 'forgot' && !message && (
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
                        )}

                        {message && (
                            <button
                                onClick={() => { setMode('signin'); setMessage(''); setError('') }}
                                className="w-full text-sm text-purple-600 hover:text-purple-700 py-2 font-bold"
                            >
                                ← Back to Sign In
                            </button>
                        )}
                    </div>

                    <p className="text-center text-sm text-gray-400 mt-6">
                        © 2026 Prodsnap. All rights reserved.
                    </p>

                    <div className="text-center mt-4">
                        <Link
                            href="/admin/login"
                            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 transition-colors"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Admin Login
                        </Link>
                    </div>
                </div>
            </div>

            <style jsx>{`
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
            `}</style>
        </div>
    )
}
