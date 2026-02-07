'use client'

import React, { useState } from 'react'
import { CheckCircle2, Loader2, Send } from 'lucide-react'

export function NewsletterForm() {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        setStatus('loading')

        try {
            const { subscribeToNewsletter } = await import('@/app/actions')
            const result = await subscribeToNewsletter(email)

            if (result.success) {
                setStatus('success')
                setMessage('Thanks for subscribing! Check your inbox soon.')
                setEmail('')
            } else {
                setStatus('error')
                setMessage(result.error || 'Something went wrong. Please try again.')
            }
        } catch (err) {
            setStatus('error')
            setMessage('Something went wrong. Please try again.')
        }
    }

    if (status === 'success') {
        return (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 animate-in fade-in zoom-in duration-500">
                <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-lg">Subscription Confirmed!</h4>
                        <p className="text-white/70 text-sm mt-1">{message}</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your work email"
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/40 placeholder:text-white/40 transition-all group-hover:bg-white/15"
                />
            </div>

            <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-white text-violet-600 font-black py-4 rounded-2xl hover:bg-violet-50 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl shadow-black/10"
            >
                {status === 'loading' ? (
                    <>
                        <Loader2 size={18} className="animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        Subscribe Free
                        <Send size={16} />
                    </>
                )}
            </button>

            {status === 'error' && (
                <p className="text-red-300 text-xs font-medium text-center">{message}</p>
            )}
        </form>
    )
}
