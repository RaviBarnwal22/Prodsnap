'use client'

import { useState } from 'react'
import { X, Upload, CheckCircle, Loader2, Phone, User, PartyPopper, Sparkles } from 'lucide-react'

interface SubscribeModalProps {
    isOpen: boolean
    onClose: () => void
    userEmail: string
    userName?: string
}

export function SubscribeModal({ isOpen, onClose, userEmail, userName }: SubscribeModalProps) {
    const [step, setStep] = useState<'payment' | 'form' | 'success'>('payment')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    // Form fields
    const [name, setName] = useState(userName || '')
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
        setError('')

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
        setError('')

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
        setStep('payment')
        setName(userName || '')
        setPhone('')
        setPaymentProof(null)
        setFileName('')
        setError('')
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition"
                    >
                        <X size={20} />
                    </button>
                    <h2 className="text-2xl font-bold mb-1">
                        {step === 'success' ? '🎉 Congratulations!' : 'Subscribe to Premium'}
                    </h2>
                    <p className="text-white/80 text-sm">
                        {step === 'payment' && 'Scan QR to pay ₹199/month'}
                        {step === 'form' && 'Complete your subscription details'}
                        {step === 'success' && 'Your learning journey just leveled up!'}
                    </p>
                </div>

                <div className="p-6">
                    {/* Step 1: Payment QR */}
                    {step === 'payment' && (
                        <div className="text-center">
                            <div className="bg-white p-4 rounded-2xl inline-block shadow-lg mb-6">
                                <img
                                    src="/upi-qr.jpg"
                                    alt="UPI QR Code"
                                    className="w-56 h-56 object-contain"
                                />
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                UPI ID: <span className="font-mono font-bold">ravibarnwal22@okhdfcbank</span>
                            </p>
                            <div className="bg-violet-50 dark:bg-violet-900/20 p-4 rounded-xl mb-6">
                                <p className="font-bold text-violet-700 dark:text-violet-300 text-xl">₹199/month</p>
                                <p className="text-sm text-violet-600 dark:text-violet-400">Unlimited access to all practice cases</p>
                            </div>
                            <button
                                onClick={() => setStep('form')}
                                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition flex items-center justify-center gap-2"
                            >
                                I've Made the Payment
                                <CheckCircle size={18} />
                            </button>
                            <p className="text-xs text-gray-500 mt-4">
                                After payment, you'll submit the screenshot for verification
                            </p>
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <p className="text-xs text-center text-gray-500 italic">
                                    If you are from outside India, kindly drop a line to <a href="mailto:support@prodsnap.in" className="text-violet-600 hover:underline">support@prodsnap.in</a> and we will assist you.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Details Form */}
                    {step === 'form' && (
                        <div className="space-y-5">
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
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-violet-500 transition bg-gray-50 dark:bg-gray-800/50">
                                    {paymentProof ? (
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="text-green-500" size={24} />
                                            <span className="text-sm font-medium text-green-600">{fileName}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="text-gray-400 mb-2" size={24} />
                                            <span className="text-sm text-gray-500">Click to upload screenshot</span>
                                            <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
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
                    )}

                    {/* Step 3: Success */}
                    {step === 'success' && (
                        <div className="text-center py-6">
                            <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce" style={{ animationDuration: '2s' }}>
                                <PartyPopper className="text-white" size={40} />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">
                                Request Submitted! 🎉
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                                Thank you for your interest in Premium!
                                Our team is reviewing your payment screenshot.
                            </p>
                            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl mb-6 text-left">
                                <p className="text-sm text-amber-900 dark:text-amber-100 font-medium mb-2">
                                    <strong>What's next?</strong>
                                </p>
                                <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                                    <li>• Our admin will verify your payment within 24 hours</li>
                                    <li>• You'll receive email confirmation once approved</li>
                                    <li>• Your account will be upgraded to premium automatically</li>
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
            </div>
        </div>
    )
}
