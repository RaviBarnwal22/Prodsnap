'use client'

import { useEffect } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Sparkles, Zap, Target, TrendingUp, GraduationCap } from 'lucide-react'

export default function LoginPage() {
    const supabase = createClient()
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectedFrom = searchParams.get('redirectedFrom')

    useEffect(() => {
        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                console.log('[AUTH UI] User signed in:', session.user.id)
                // Redirect to intended page or home
                const targetPath = redirectedFrom || '/'
                console.log('[AUTH UI] Redirecting to:', targetPath)
                router.push(targetPath)
                router.refresh()
            }
        })

        return () => subscription.unsubscribe()
    }, [router, redirectedFrom, supabase.auth])

    const features = [
        { icon: <Sparkles size={20} />, text: "AI-Powered Feedback", color: "from-yellow-400 to-orange-500" },
        { icon: <GraduationCap size={20} />, text: "IIM(Gold Medalist) Grad Mentorship", color: "from-red-400 to-pink-500" },
        { icon: <Target size={20} />, text: "Diverse Case Studies", color: "from-green-400 to-emerald-500" },
        { icon: <Zap size={20} />, text: "Real-Time Practice", color: "from-blue-400 to-cyan-500" },
        { icon: <TrendingUp size={20} />, text: "Track Your Growth", color: "from-purple-400 to-pink-500" },
    ]

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Colorful Branding Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/30 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
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
                        <h2 className="text-3xl font-bold mb-2">👋 Welcome!</h2>
                        <p className="text-gray-500">Sign in to continue your PM journey</p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl">
                        <Auth
                            supabaseClient={supabase}
                            appearance={{
                                theme: ThemeSupa,
                                variables: {
                                    default: {
                                        colors: {
                                            brand: 'rgb(147 51 234)', // purple-600
                                            brandAccent: 'rgb(124 58 237)', // purple-700
                                            brandButtonText: 'white',
                                            defaultButtonBackground: 'white',
                                            defaultButtonBackgroundHover: 'rgb(249 250 251)',
                                            inputBackground: 'white',
                                            inputBorder: 'rgb(229 231 235)',
                                            inputBorderHover: 'rgb(147 51 234)',
                                            inputBorderFocus: 'rgb(147 51 234)',
                                        },
                                        space: {
                                            inputPadding: '12px',
                                            buttonPadding: '12px 16px',
                                        },
                                        borderWidths: {
                                            buttonBorderWidth: '0px',
                                            inputBorderWidth: '2px',
                                        },
                                        radii: {
                                            borderRadiusButton: '12px',
                                            buttonBorderRadius: '12px',
                                            inputBorderRadius: '12px',
                                        },
                                        fontSizes: {
                                            baseBodySize: '16px',
                                            baseInputSize: '16px',
                                            baseLabelSize: '14px',
                                            baseButtonSize: '16px',
                                        },
                                        fonts: {
                                            bodyFontFamily: 'ui-sans-serif, system-ui, sans-serif',
                                            buttonFontFamily: 'ui-sans-serif, system-ui, sans-serif',
                                            inputFontFamily: 'ui-sans-serif, system-ui, sans-serif',
                                            labelFontFamily: 'ui-sans-serif, system-ui, sans-serif',
                                        },
                                    },
                                },
                                className: {
                                    container: 'supabase-auth-container',
                                    button: 'supabase-auth-button font-bold',
                                    input: 'supabase-auth-input font-medium',
                                    label: 'supabase-auth-label font-bold',
                                },
                            }}
                            localization={{
                                variables: {
                                    sign_in: {
                                        email_label: 'Email',
                                        password_label: 'Password',
                                        button_label: 'Sign In',
                                        loading_button_label: 'Signing in...',
                                        email_input_placeholder: 'you@example.com',
                                        password_input_placeholder: '••••••••',
                                        link_text: "Don't have an account? Sign up",
                                    },
                                    sign_up: {
                                        email_label: 'Email',
                                        password_label: 'Password',
                                        button_label: 'Create Account',
                                        loading_button_label: 'Creating account...',
                                        email_input_placeholder: 'you@example.com',
                                        password_input_placeholder: 'Min 6 characters',
                                        link_text: 'Already have an account? Sign in',
                                    },
                                    forgotten_password: {
                                        email_label: 'Email',
                                        button_label: 'Send Reset Link',
                                        loading_button_label: 'Sending...',
                                        link_text: 'Forgot your password?',
                                        confirmation_text: 'Check your email for the reset link',
                                    },
                                },
                            }}
                            providers={[]}
                            redirectTo={`${window.location.origin}/auth/callback`}
                            onlyThirdPartyProviders={false}
                        />
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
        </div>
    )
}
