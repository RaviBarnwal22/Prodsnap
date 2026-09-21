'use client'

import { FREE_ATTEMPT_LIMIT } from '@/lib/constants'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Crown, Check, Zap, BookOpen, Trophy, Sparkles, Loader2, PartyPopper } from 'lucide-react'

interface PremiumUpgradeModalProps {
    isOpen: boolean
    onClose: () => void
    category?: string
    attemptsUsed?: number
    userEmail?: string
    userName?: string
}

const features = [
    { icon: BookOpen, text: "Unlimited case practice across all categories" },
    { icon: Zap, text: "AI-powered instant feedback on every answer" },
    { icon: Trophy, text: "Access to premium expert solutions" },
    { icon: Sparkles, text: "Priority access to new content & features" },
]

import { createPortal } from 'react-dom'

export function PremiumUpgradeModal({ isOpen, onClose, category, attemptsUsed = FREE_ATTEMPT_LIMIT, userEmail = '', userName = '' }: PremiumUpgradeModalProps) {
    const router = useRouter()
    const [step, setStep] = useState<'info' | 'payment' | 'success'>('info')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [name, setName] = useState(userName)
    const [phone, setPhone] = useState('')

    const handleCashfreePayment = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/payment/cashfree-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'subscription',
                    name: name || userName || 'Learner',
                    email: userEmail,
                    phone: phone || '9999999999',
                    planType: 'monthly'
                })
            })

            const data = await res.json()
            if (!res.ok || !data.paymentSessionId) {
                throw new Error(data.error || 'Failed to initialize payment session')
            }

            if (typeof (window as any).Cashfree === 'undefined') {
                await new Promise<void>((resolve, reject) => {
                    const script = document.createElement('script')
                    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js'
                    script.onload = () => resolve()
                    script.onerror = () => reject(new Error('Failed to load Cashfree payment SDK'))
                    document.body.appendChild(script)
                })
            }

            const cashfree = (window as any).Cashfree({
                mode: data.environment || 'production'
            })

            await cashfree.checkout({
                paymentSessionId: data.paymentSessionId,
                redirectTarget: '_modal'
            })

            const verifyRes = await fetch('/api/payment/cashfree-verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: data.orderId })
            })

            const verifyData = await verifyRes.json()
            if (verifyData.success && verifyData.status === 'PAID') {
                setStep('success')
            } else if (verifyData.status === 'ACTIVE') {
                setError('Payment was not completed. You can try again.')
            } else {
                setError(verifyData.message || 'Payment could not be verified.')
            }
        } catch (err: any) {
            console.error('[Cashfree] Subscription checkout error:', err)
            setError(err.message || 'Something went wrong during payment.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        const wasActivated = step === 'success'
        setStep('info')
        setName(userName)
        setPhone('')
        setError(null)
        onClose()
        // Premium is already active server-side; re-fetch so the badge and unlocked
        // content appear without the user having to reload manually.
        if (wasActivated) router.refresh()
    }

    if (!isOpen || typeof document === 'undefined') return null

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10"
                >
                    <X size={20} className="text-gray-500" />
                </button>

                {/* Step 1: Info/Features */}
                {step === 'info' && (
                    <>
                        {/* Header with gradient */}
                        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 text-white text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                <Crown size={32} className="text-yellow-300" />
                            </div>
                            <h2 className="text-2xl font-black mb-2">
                                Upgrade to Premium
                            </h2>
                            <p className="text-blue-100 text-sm">
                                {attemptsUsed !== undefined && attemptsUsed >= FREE_ATTEMPT_LIMIT
                                    ? `You've used ${attemptsUsed}/${FREE_ATTEMPT_LIMIT} free attempts`
                                    : 'Unlock unlimited practice across all categories'
                                }
                            </p>
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            {/* Price */}
                            <div className="text-center mb-8">
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-5xl font-black text-gray-900 dark:text-white">₹199</span>
                                    <span className="text-gray-500 font-medium">/month</span>
                                </div>
                                <p className="text-sm text-gray-400 mt-2">Cancel anytime • No hidden charges</p>
                            </div>

                            {/* Features */}
                            <div className="space-y-4 mb-8">
                                {features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                                            <feature.icon size={18} className="text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                                            {feature.text}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* CTA Button */}
                            <button
                                onClick={() => setStep('payment')}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                            >
                                <Check size={20} />
                                Subscribe Now
                            </button>

                            <p className="text-xs text-gray-400 text-center mt-4">
                                Pay via UPI • Instant activation
                            </p>
                        </div>
                    </>
                )}

                {/* Step 2: Payment Options */}
                {step === 'payment' && (
                    <>
                        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white">
                            <h2 className="text-xl font-bold">Select Payment Method</h2>
                            <p className="text-white/80 text-sm">₹199 / month • Instant Activation</p>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4 text-center">
                                {/* Cashfree Instant Payment Option */}
                                <div className="bg-violet-50 dark:bg-violet-900/20 p-5 rounded-2xl border border-violet-200 dark:border-violet-800">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="text-left">
                                            <p className="font-bold text-gray-900 dark:text-white">Online Payment (Instant)</p>
                                            <p className="text-xs text-gray-500">Google Pay, PhonePe, Paytm, Cards & UPI</p>
                                        </div>
                                        <span className="font-black text-xl text-violet-600 dark:text-violet-400">₹199</span>
                                    </div>
                                    <button
                                        onClick={handleCashfreePayment}
                                        disabled={isLoading}
                                        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3.5 rounded-xl font-bold hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Opening Cashfree...
                                            </>
                                        ) : (
                                            <>
                                                <Zap size={18} />
                                                Pay ₹199 via Cashfree
                                            </>
                                        )}
                                    </button>
                                </div>

                                <button
                                    onClick={() => setStep('info')}
                                    className="w-full text-gray-500 hover:text-gray-700 text-xs mt-2"
                                >
                                    ← Back
                                </button>
                                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                                    <p className="text-xs text-center text-gray-500 italic">
                                        If you are from outside India, kindly drop a line to <a href="mailto:support@prodsnap.in" className="text-violet-600 hover:underline">support@prodsnap.in</a> and we will assist you.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Step 4: Success */}
                {step === 'success' && (
                    <div className="p-8 text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce" style={{ animationDuration: '2s' }}>
                            <PartyPopper className="text-white" size={40} />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">
                            Premium Activated! 🎉
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                            Your payment was successful and Premium is now active on your account. Enjoy unlimited access!
                        </p>
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl mb-6 text-left">
                            <p className="text-sm text-amber-900 dark:text-amber-100 font-medium mb-2">
                                <strong>What's next?</strong>
                            </p>
                            <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                                <li>• Your Premium access is live right now — no waiting</li>
                                <li>• A receipt has been emailed to {userEmail}</li>
                                <li>• All premium questions and features are unlocked</li>
                            </ul>
                        </div>
                        <button
                            onClick={handleClose}
                            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition"
                        >
                            Start Practicing
                        </button>
                    </div>
                )}
            </div>
        </div>,
        document.body
    )
}
