'use client'

import { FREE_ATTEMPT_LIMIT } from '@/lib/constants'
import { useState } from 'react'
import { X, Crown, Check, Zap, BookOpen, Trophy, Sparkles, Upload, CheckCircle, Loader2, Phone, User, PartyPopper } from 'lucide-react'

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
    const [step, setStep] = useState<'info' | 'payment' | 'form' | 'success'>('info')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form fields
    const [name, setName] = useState(userName)
    const [phone, setPhone] = useState('')
    const [paymentProof, setPaymentProof] = useState<string | null>(null)
    const [fileName, setFileName] = useState('')

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB')
            return
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file')
            return
        }

        setFileName(file.name)
        setError(null)

        // Convert to base64
        const reader = new FileReader()
        reader.onload = () => {
            setPaymentProof(reader.result as string)
        }
        reader.readAsDataURL(file)
    }

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError('Please enter your name')
            return
        }
        if (!phone.trim() || phone.length < 10) {
            setError('Please enter a valid phone number')
            return
        }
        if (!paymentProof) {
            setError('Please upload payment screenshot')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/subscription-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    phone: phone.trim(),
                    paymentProof
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit request')
            }

            setStep('success')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        setStep('info')
        setName(userName)
        setPhone('')
        setPaymentProof(null)
        setFileName('')
        setError(null)
        onClose()
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

                {/* Step 2: Payment QR */}
                {step === 'payment' && (
                    <>
                        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white">
                            <h2 className="text-xl font-bold">Step 1: Make Payment</h2>
                            <p className="text-white/80 text-sm">Scan QR code to pay ₹199</p>
                        </div>

                        <div className="p-6">
                            <div className="text-center">
                                <div className="bg-white p-4 rounded-2xl inline-block shadow-lg mb-6 border border-gray-100">
                                    <img
                                        src="/upi-qr.jpg"
                                        alt="UPI QR Code"
                                        className="w-48 h-48 object-contain"
                                    />
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    UPI ID: <span className="font-mono font-bold text-gray-900 dark:text-white">ravibarnwal22@okhdfcbank</span>
                                </p>
                                <div className="bg-violet-50 dark:bg-violet-900/20 p-3 rounded-xl mb-6">
                                    <p className="font-bold text-violet-700 dark:text-violet-300 text-lg">₹199</p>
                                </div>
                                <button
                                    onClick={() => setStep('form')}
                                    className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition flex items-center justify-center gap-2"
                                >
                                    I've Made the Payment
                                    <CheckCircle size={18} />
                                </button>
                                <button
                                    onClick={() => setStep('info')}
                                    className="w-full text-gray-500 hover:text-gray-700 text-sm mt-4"
                                >
                                    ← Back
                                </button>
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <p className="text-xs text-center text-gray-500 italic">
                                        If you are from outside India, kindly drop a line to <a href="mailto:support@prodsnap.in" className="text-violet-600 hover:underline">support@prodsnap.in</a> and we will assist you.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Step 3: Details Form */}
                {step === 'form' && (
                    <>
                        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white">
                            <h2 className="text-xl font-bold">Step 2: Submit Details</h2>
                            <p className="text-white/80 text-sm">Upload payment screenshot for verification</p>
                        </div>

                        <div className="p-6 space-y-5">
                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-2">Full Name *</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:border-violet-500 outline-none transition"
                                        placeholder="Enter your full name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={userEmail}
                                    disabled
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Phone Number *</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:border-violet-500 outline-none transition"
                                        placeholder="Enter 10-digit phone number"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Payment Screenshot *</label>
                                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-violet-500 transition bg-gray-50 dark:bg-gray-800/50">
                                    {paymentProof ? (
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="text-green-500" size={24} />
                                            <span className="text-sm font-medium text-green-600">{fileName}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="text-gray-400 mb-2" size={24} />
                                            <span className="text-sm text-gray-500">Click to upload screenshot</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        Submit for Verification
                                        <Sparkles size={18} />
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => setStep('payment')}
                                className="w-full text-gray-500 hover:text-gray-700 text-sm"
                            >
                                ← Back to payment
                            </button>
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
                            Request Submitted! 🎉
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                            Thank you for your interest in upgrading to Premium!
                            Our team is reviewing your payment screenshot.
                        </p>
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl mb-6 text-left">
                            <p className="text-sm text-amber-900 dark:text-amber-100 font-medium mb-2">
                                <strong>What's next?</strong>
                            </p>
                            <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                                <li>• Our admin will verify your payment within 24 hours</li>
                                <li>• You'll receive an email confirmation once approved</li>
                                <li>• Your premium badge will appear automatically</li>
                            </ul>
                        </div>
                        <button
                            onClick={handleClose}
                            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition"
                        >
                            Got it, Thanks!
                        </button>
                    </div>
                )}
            </div>
        </div>,
        document.body
    )
}
