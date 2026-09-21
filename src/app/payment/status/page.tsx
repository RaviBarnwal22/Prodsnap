"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, AlertCircle, Loader2, Calendar, ArrowRight, ShieldCheck } from "lucide-react"

function PaymentStatusContent() {
    const searchParams = useSearchParams()
    const orderId = searchParams.get("order_id") || searchParams.get("orderId")

    const [status, setStatus] = useState<"loading" | "success" | "pending" | "failed">("loading")
    const [paymentData, setPaymentData] = useState<any>(null)
    const [errorMessage, setErrorMessage] = useState<string>("")

    const checkVerification = async () => {
        if (!orderId) {
            setStatus("failed")
            setErrorMessage("No Order ID found in request.")
            return
        }

        setStatus("loading")
        try {
            const res = await fetch(`/api/payment/cashfree-verify?order_id=${encodeURIComponent(orderId)}`)
            const data = await res.json()

            if (data.success && data.status === "PAID") {
                setStatus("success")
                setPaymentData(data)
            } else if (data.status === "ACTIVE") {
                setStatus("pending")
                setPaymentData(data)
            } else {
                setStatus("failed")
                setErrorMessage(data.message || "Payment could not be verified.")
            }
        } catch (err: any) {
            console.error("Verification check failed:", err)
            setStatus("failed")
            setErrorMessage("Network error while verifying payment status.")
        }
    }

    useEffect(() => {
        checkVerification()
    }, [orderId])

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden text-center p-8">
                {status === "loading" && (
                    <div className="py-12 space-y-4">
                        <div className="w-16 h-16 rounded-full bg-violet-50 dark:bg-violet-900/30 text-violet-600 flex items-center justify-center mx-auto">
                            <Loader2 size={36} className="animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Verifying Payment
                        </h2>
                        <p className="text-gray-500 text-sm max-w-xs mx-auto">
                            Please wait while we confirm your transaction securely with Cashfree...
                        </p>
                    </div>
                )}

                {status === "success" && (
                    <div className="space-y-6 animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                            <CheckCircle2 size={44} />
                        </div>

                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs font-semibold mb-3">
                                <ShieldCheck size={14} />
                                Verified via Cashfree
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                                {paymentData?.type === "subscription"
                                    ? "Premium Activated!"
                                    : "Payment Confirmed!"}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                {paymentData?.serviceType || "Mentorship Session"}
                            </p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 text-left space-y-2.5 text-sm border border-gray-100 dark:border-gray-800">
                            {paymentData?.amount && (
                                <div className="flex justify-between items-center py-1 border-b border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-500">Amount Paid</span>
                                    <span className="font-bold text-gray-900 dark:text-white">₹{paymentData.amount}</span>
                                </div>
                            )}
                            {orderId && (
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-gray-500">Order Reference</span>
                                    <span className="font-mono text-xs text-gray-700 dark:text-gray-300 truncate max-w-[180px]">{orderId}</span>
                                </div>
                            )}
                        </div>

                        <div className="bg-violet-50 dark:bg-violet-900/20 rounded-xl p-4 text-left text-xs text-violet-900 dark:text-violet-200 space-y-1">
                            <p className="font-semibold flex items-center gap-1.5">
                                <Calendar size={14} /> Confirmation Email Sent
                            </p>
                            <p className="opacity-90">
                                We've sent a receipt & booking confirmation to your email from <strong>info.prodsnap@gmail.com</strong>.
                            </p>
                        </div>

                        {/* Embedded Calendly Scheduling Widget */}
                        <div className="mt-6 text-left">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <Calendar className="text-violet-600" size={20} />
                                Schedule Your 1:1 Call Now
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                Choose your preferred date and time slot from the calendar below.
                            </p>
                            <div className="w-full bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm" style={{ height: "650px" }}>
                                <iframe
                                    src={`${process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com'}?embed_domain=${encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : '')}&embed_type=Inline`}
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    title="Schedule Session"
                                ></iframe>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Link
                                href={paymentData?.type === "subscription" ? "/practice" : "/mentorship"}
                                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20 transition-all"
                            >
                                {paymentData?.type === "subscription" ? "Start Practicing" : "Return to Mentorship Page"}
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                )}

                {status === "pending" && (
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                            <Loader2 size={36} className="animate-spin" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Payment In Progress
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">
                                If you completed the payment in your UPI app or bank, it might take a few moments to confirm.
                            </p>
                        </div>
                        <button
                            onClick={checkVerification}
                            className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold hover:opacity-90 transition"
                        >
                            Check Status Again
                        </button>
                    </div>
                )}

                {status === "failed" && (
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto">
                            <AlertCircle size={36} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Payment Incomplete
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">
                                {errorMessage || "We couldn't confirm the transaction. If money was deducted, it will be refunded or verified shortly."}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={checkVerification}
                                className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-bold hover:bg-gray-200 transition"
                            >
                                Re-check
                            </button>
                            <Link
                                href="/mentorship"
                                className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition flex items-center justify-center"
                            >
                                Try Again
                            </Link>
                        </div>
                        <p className="text-xs text-gray-400">
                            Need help? Contact <a href="mailto:support@prodsnap.in" className="text-violet-600 hover:underline">support@prodsnap.in</a>
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function PaymentStatusPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-violet-600" />
            </div>
        }>
            <PaymentStatusContent />
        </Suspense>
    )
}
