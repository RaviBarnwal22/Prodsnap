'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Zap, RefreshCw, Loader2, ArrowRight, Lock, ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { checkUserExists } from '@/app/actions'

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
}

type AuthStep = 'email' | 'login' | 'signup' | 'otp'

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [step, setStep] = useState<AuthStep>('email')
    const [otpCode, setOtpCode] = useState<string[]>(new Array(8).fill(""))
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [resendCountdown, setResendCountdown] = useState(0)

    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        if (!isOpen) {
            setStep('email')
            setEmail('')
            setPassword('')
            setFirstName('')
            setLastName('')
            setOtpCode(new Array(8).fill(""))
            setError('')
            setMessage('')
            setIsLoading(false)
        }
    }, [isOpen])

    useEffect(() => {
        let timer: NodeJS.Timeout
        if (resendCountdown > 0) {
            timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000)
        }
        return () => clearTimeout(timer)
    }, [resendCountdown])

    const handleCheckEmail = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return
        setIsLoading(true)
        setError('')
        try {
            const { exists, error: dbError } = await checkUserExists(email)
            if (dbError) {
                setError(dbError)
            } else if (exists) {
                setStep('login')
            } else {
                setStep('signup')
            }
        } catch (err) {
            setError('An unexpected error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) {
                setError(error.message)
            } else if (data.session) {
                setMessage('Successfully logged in!')
                setTimeout(() => {
                    if (onSuccess) onSuccess()
                    router.refresh()
                }, 1000)
            }
        } catch (err) {
            setError('Sign in failed')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        first_name: firstName,
                        last_name: lastName,
                        full_name: `${firstName} ${lastName}`
                    }
                }
            })
            if (error) {
                setError(error.message)
            } else {
                setStep('otp')
                setResendCountdown(60)
                setMessage('Account created! Please verify with the 8-digit OTP.')
            }
        } catch (err) {
            setError('Sign up failed')
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        const token = otpCode.join('')
        if (token.length !== 8) {
            setError('Please enter the 8-digit code')
            return
        }
        setIsLoading(true)
        setError('')
        try {
            const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' })
            if (error) {
                setError(error.message)
            } else if (data.session) {
                setMessage('Verified! Welcome to Prodsnap.')
                setTimeout(() => {
                    if (onSuccess) onSuccess()
                    router.refresh()
                }, 1000)
            }
        } catch (err) {
            setError('Verification failed')
        } finally {
            setIsLoading(false)
        }
    }

    const handleOtpChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return false
        const newOtp = [...otpCode]
        newOtp[index] = element.value
        setOtpCode(newOtp)
        if (element.nextSibling && element.value !== "") {
            (element.nextSibling as HTMLInputElement).focus()
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && otpCode[index] === "" && index > 0) {
            (e.currentTarget.previousSibling as HTMLInputElement)?.focus()
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors z-10"><X size={24} /></button>
                {step !== 'email' && step !== 'otp' && (
                    <button onClick={() => setStep('email')} className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors z-10 flex items-center gap-1 text-xs font-bold"><ChevronLeft size={16} />Back</button>
                )}
                <div className="p-8 pb-12">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 text-blue-600 mx-auto">
                        {step === 'otp' ? <Zap size={32} className="text-yellow-500" /> : <Mail size={32} />}
                    </div>
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-black mb-2 tracking-tight">
                            {step === 'email' && 'Sign In'}
                            {step === 'login' && 'Welcome Back'}
                            {step === 'signup' && 'Create Account'}
                            {step === 'otp' && 'Verify Email'}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                            {step === 'email' && 'Enter your email to get started.'}
                            {step === 'login' && `Enter your password for ${email}`}
                            {step === 'signup' && 'Join the community of 10k+ PMs.'}
                            {step === 'otp' && `We sent an 8-digit code to ${email}`}
                        </p>
                    </div>
                    <AnimatePresence mode="wait">
                        {step === 'email' && (
                            <motion.form key="email" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} onSubmit={handleCheckEmail} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 rounded-2xl pl-12 pr-6 py-4 outline-none transition-all font-medium" />
                                    </div>
                                </div>
                                {error && <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm font-bold border border-red-100">{error}</div>}
                                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50">
                                    {isLoading ? <Loader2 className="animate-spin" size={24} /> : <>Continue<ArrowRight size={20} /></>}
                                </button>
                            </motion.form>
                        )}
                        {step === 'login' && (
                            <motion.form key="login" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-2xl pl-12 pr-6 py-4 outline-none transition-all font-medium" />
                                    </div>
                                </div>
                                {error && <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm font-bold border border-red-100">{error}</div>}
                                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50">
                                    {isLoading ? <Loader2 className="animate-spin" size={24} /> : 'Sign In'}
                                </button>
                            </motion.form>
                        )}
                        {step === 'signup' && (
                            <motion.form key="signup" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} onSubmit={handleSignUp} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">First Name</label>
                                        <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John" className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-2xl px-6 py-4 outline-none transition-all font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Last Name</label>
                                        <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-2xl px-6 py-4 outline-none transition-all font-medium" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-2xl pl-12 pr-6 py-4 outline-none transition-all font-medium" />
                                    </div>
                                </div>
                                {error && <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm font-bold border border-red-100">{error}</div>}
                                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50">
                                    {isLoading ? <Loader2 className="animate-spin" size={24} /> : 'Create Account'}
                                </button>
                            </motion.form>
                        )}
                        {step === 'otp' && (
                            <motion.form key="otp" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onSubmit={handleVerifyOtp} className="space-y-6">
                                <div className="flex justify-between gap-1 max-w-[340px] mx-auto">
                                    {otpCode.map((data, index) => (
                                        <input key={index} type="text" maxLength={1} value={data} onChange={e => handleOtpChange(e.target, index)} onKeyDown={e => handleKeyDown(e, index)} className="w-8 h-12 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl text-center text-xl font-bold focus:border-blue-500 transition-all outline-none" />
                                    ))}
                                </div>
                                {error && <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-bold border border-red-100 text-center">{error}</div>}
                                {message && <div className="p-3 rounded-xl bg-green-50 text-green-600 text-xs font-bold text-center">{message}</div>}
                                <div className="space-y-4">
                                    <button type="submit" disabled={isLoading || otpCode.join('').length !== 8} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 disabled:opacity-50">
                                        {isLoading ? <Loader2 className="animate-spin" size={24} /> : 'Verify & Continue'}
                                    </button>
                                    <div className="text-center">
                                        {resendCountdown > 0 ? (
                                            <p className="text-gray-400 text-sm font-bold">Resend in <span className="text-blue-500">{resendCountdown}s</span></p>
                                        ) : (
                                            <button type="button" onClick={handleSignUp} disabled={isLoading} className="text-blue-600 hover:text-blue-700 text-sm font-black flex items-center justify-center gap-1 mx-auto"><RefreshCw size={14} />Resend Code</button>
                                        )}
                                    </div>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    )
}
