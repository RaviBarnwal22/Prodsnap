'use client'

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from '@/lib/supabase/client'
import { useAuth } from "@/components/AuthContext"
import { MENTORSHIP_SERVICES, formatPriceINR, DEMO_SERVICE_TITLE } from "@/lib/constants"
import {
    Star,
    GraduationCap,
    Award,
    Calendar,
    Clock,
    CheckCircle,
    CheckCircle2,
    MessageSquare,
    Trophy,
    Building2,
    X,
    Loader2,
    ArrowRight,
    CreditCard,
    Upload,
    Camera,
    AlertCircle,
    Mic,
    Sparkles,
    Lock,
    ShieldCheck,
    ChevronDown,
    ChevronUp,
    Target,
    BarChart3,
    Rocket,
    Cpu,
    Search,
    Briefcase,
    Users,
    TrendingUp
} from "lucide-react"

export default function MentorshipClient() {
    const router = useRouter()
    // TEMPORARY — the ₹1 demo package is only offered on /mentorship?demo=1 so real
    // customers never see it. Remove with the demo entry in lib/constants.ts.
    const showDemoPackage = useSearchParams().get('demo') === '1'
    const { openAuthModal } = useAuth()

    const [selectedService, setSelectedService] = useState<any>(null)
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false)
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'checkout' | 'success'>('idle')
    const [errorMessage, setErrorMessage] = useState('')

    // Form state
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [linkedin, setLinkedin] = useState('')
    const [message, setMessage] = useState('')
    const [errors, setErrors] = useState<{ fullName?: string; email?: string; phone?: string }>({})

    // User authentication state
    const [userId, setUserId] = useState<string | null>(null)
    const [showAllTestimonials, setShowAllTestimonials] = useState(false)

    // Auto-fill email from logged-in user and listen for changes
    useEffect(() => {
        const fetchUserEmail = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setEmail(user.email || "")
                setUserId(user.id)
            } else {
                setUserId(null)
            }
        }
        fetchUserEmail()

        // Listen for auth state changes (crucial for modal login)
        const supabase = createClient()
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setEmail(session.user.email || "")
                setUserId(session.user.id)
            } else {
                setUserId(null)
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const mentor = {
        name: "Ravi Barnwal",
        title: "Product Leader & Mentor",
        tagline: "Helping aspiring PMs crack their dream roles",
        image: "/ravi-headshot.jpg",
        linkedIn: "https://www.linkedin.com/in/barnwalravi/",
        bio: "Ravi is a Product Leader with extensive experience in building and scaling products at top-tier tech companies. His mentorship style is practical, focusing on first-principles thinking, real-world case studies, and AI-powered learning, leveraging tools like AI mock interviews, intelligent resume feedback, and data-driven career coaching to accelerate your PM journey.",
        stats: {
            mentees: "100+",
            successRate: "90%",
            sessions: "500+",
            companies: ["Google", "Flipkart", "Razorpay", "Swiggy"]
        },
        skills: [
            "Product Strategy",
            "Interview Prep",
            "Resume Review",
            "Career Guidance",
            "Go-to-Market",
            "Growth Hacking"
        ],
        accolades: [
            { icon: <GraduationCap size={20} />, title: "IIM Gold Medalist", description: "Graduated with distinction from a premier B-school" },
            { icon: <Award size={20} />, title: "Building ProdSnap", description: "Built India's leading PM interview prep platform" },
            { icon: <Trophy size={20} />, title: "Top Mentor on Unstop", description: "Recognized as a top-rated mentor helping aspiring PMs" },
            { icon: <Mic size={20} />, title: "Guest Speaker & Panelist", description: "Speaker at ISB (Indian School of Business) Hyderabad & Mohali, IIMs & top tech forums" },
        ],
        testimonials: [
            {
                name: "Akanksha Shivanee",
                role: "IIM Raipur",
                quote: "I had an insightful session with Ravi, He gave me a detail feedback of my resume and this clarification was extremely helpful. Overall this session gave me clarity, direction, and actionable steps to improve my profile. I found the guidance very practical and motivating.",
                linkedin: "https://www.linkedin.com/in/akanksha-shivanee-087114212/",
                stars: 5
            },
            {
                name: "Umang Agarwal",
                role: "IIT Patna",
                quote: "Very humble and answerable mentor, has clear thoughts. I got my doubts solved!",
                linkedin: "https://www.linkedin.com/in/umang-agarwal17/",
                stars: 5
            },
            {
                name: "Bhumi Barkur",
                role: "IIT Bombay",
                quote: "Very good mentorship guidance given by him. It was really insightful!",
                linkedin: "https://www.linkedin.com/in/bhumi-barkur-089629298/",
                stars: 5
            },
            {
                name: "Shreyash Roy",
                role: "IIT Jodhpur",
                quote: "Very clear, patient and understanding.",
                linkedin: "https://www.linkedin.com/in/shreyashroy/",
                stars: 5
            },
            {
                name: "Vybhav Angu",
                role: "Vedanta",
                quote: "Ravi sir was very helpful as he answered queries in simple way.",
                stars: 5
            },
            {
                name: "Moula Sai",
                role: "Woxsen University",
                quote: "Had a great interaction and Ravi explained everything with clear-cut clarification and examples. His expertise helped me a lot. Overall, learned a lot of new things.",
                linkedin: "https://www.linkedin.com/in/moula-sai/",
                stars: 5
            },
            {
                name: "Vidisha Pandey",
                role: "Nseix",
                quote: "Very insightful session. Helped me to understand what career options I have and how should I move ahead with current skills and knowledge to achieve a better role in future.",
                linkedin: "https://www.linkedin.com/in/vidishanirajpandey/",
                stars: 5
            },
            {
                name: "Satvik Sehgal",
                role: "IMI New Delhi",
                quote: "Very helpful session. Mentor was really friendly.",
                stars: 5
            },
            {
                name: "Gargi Narayan",
                role: "Ramjas College, University of Delhi",
                quote: "It was a great session, he cleared all my doubts and gave honest opinions.",
                stars: 5
            },
            {
                name: "Somrita Ghosh",
                role: "IFEEL, Lonavala",
                quote: "Thank you so much Sir for this insightful session.",
                stars: 4
            },
            {
                name: "Karthik P S",
                role: "BMSCE, Bangalore",
                quote: "Very clear and patient, clearly understood what mentorship I am looking for and guided me likewise. The conversation was very interesting.",
                stars: 5
            },
            {
                name: "Sujan Debnath",
                role: "PCMT, Kolkata",
                quote: "Excellent Mentor! He solved all my queries.",
                stars: 5
            }
        ],
        services: [
            {
                title: "1:1 Mock Interview",
                duration: MENTORSHIP_SERVICES["1:1 Mock Interview"].duration,
                price: formatPriceINR(MENTORSHIP_SERVICES["1:1 Mock Interview"].priceINR),
                description: "Full mock PM interview with detailed feedback on product sense, execution, and behavioral questions.",
                features: ["Real PM interview simulation", "Detailed written feedback", "Recording shared", "Follow-up tips"],
                popular: true
            },
            {
                title: "Resume Review",
                duration: MENTORSHIP_SERVICES["Resume Review"].duration,
                price: formatPriceINR(MENTORSHIP_SERVICES["Resume Review"].priceINR),
                description: "Deep dive into your resume to make it ATS-friendly and impactful for top-tier PM roles.",
                features: ["Line-by-line review", "ATS optimization", "Action verb enhancement", "Storytelling tips"]
            },
            {
                title: "Career Strategy",
                duration: MENTORSHIP_SERVICES["Career Strategy"].duration,
                price: formatPriceINR(MENTORSHIP_SERVICES["Career Strategy"].priceINR),
                description: "Personalized roadmap to transition into PM or grow in your current PM role.",
                features: ["Skill gap analysis", "Company targeting strategy", "Networking plan", "Resource toolkit"]
            },
            // TEMPORARY — remove with the demo entry in lib/constants.ts
            ...(showDemoPackage ? [{
                title: DEMO_SERVICE_TITLE,
                duration: MENTORSHIP_SERVICES[DEMO_SERVICE_TITLE].duration,
                price: formatPriceINR(MENTORSHIP_SERVICES[DEMO_SERVICE_TITLE].priceINR),
                description: "Internal test package used to verify the live payment flow. Not a real session.",
                features: ["Payment flow verification only"]
            }] : [])
        ]
    }

    const handleBookNow = (service: any) => {
        setSelectedService(service)
        setPaymentStatus('idle')
        // Reset form
        setFullName('')
        setPhone('')
        setLinkedin('')
        setMessage('')
        setErrors({})
        setErrorMessage('')
    }

    const validateForm = () => {
        const newErrors: { fullName?: string; email?: string; phone?: string } = {}

        // Full Name validation
        if (!fullName.trim()) {
            newErrors.fullName = 'Full name is required'
        } else if (fullName.trim().length < 2) {
            newErrors.fullName = 'Name must be at least 2 characters'
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!email.trim()) {
            newErrors.email = 'Email address is required'
        } else if (!emailRegex.test(email.trim())) {
            newErrors.email = 'Please enter a valid email address'
        }

        // Phone validation (Indian phone numbers)
        const phoneRegex = /^[+]?[0-9\s-]{10,15}$/
        if (!phone.trim()) {
            newErrors.phone = 'Phone number is required'
        } else if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Please enter a valid phone number (10+ digits)'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleProceedToPayment = () => {
        if (validateForm()) {
            setPaymentStatus('checkout')
            setErrorMessage('')
        }
    }

    const handlePayWithCashfree = async () => {
        if (!validateForm()) {
            setPaymentStatus('idle')
            return
        }

        setIsPaymentProcessing(true)
        setErrorMessage('')

        try {
            // 1. Create order on server — the server resolves the price from its own catalog
            const res = await fetch('/api/payment/cashfree-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'mentorship',
                    name: fullName,
                    email,
                    phone,
                    serviceType: selectedService.title,
                    linkedinProfile: linkedin,
                    messageToMentor: message
                })
            })

            const data = await res.json()

            if (!res.ok || !data.paymentSessionId) {
                throw new Error(data.error || 'Failed to initiate payment session')
            }

            // 2. Ensure Cashfree SDK is loaded in window
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

            // 3. Open Cashfree modal checkout
            await cashfree.checkout({
                paymentSessionId: data.paymentSessionId,
                redirectTarget: '_modal'
            })

            // 4. Verify payment status with backend
            const verifyRes = await fetch('/api/payment/cashfree-verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: data.orderId })
            })

            const verifyData = await verifyRes.json()

            if (verifyData.success && verifyData.status === 'PAID') {
                setPaymentStatus('success')
            } else if (verifyData.status === 'ACTIVE') {
                setErrorMessage('Payment was not completed. You can try again whenever you are ready.')
            } else {
                setErrorMessage(verifyData.message || 'Payment could not be verified.')
            }
        } catch (err: any) {
            console.error('[Cashfree Checkout Error]:', err)
            setErrorMessage(err.message || 'Failed to complete payment. Please try again.')
        } finally {
            setIsPaymentProcessing(false)
        }
    }



    return (
        <main className="flex-grow pt-20">
            {/* Payment Modal */}
            {selectedService && (
                <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm z-[100]">
                    <div className="bg-white dark:bg-gray-800 rounded-t-3xl md:rounded-3xl shadow-2xl max-w-md w-full max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 md:fade-in md:zoom-in duration-200 backdrop-blur-md">
                        <div className="shrink-0 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold">
                                {paymentStatus === 'success' ? 'Booking Confirmed' : paymentStatus === 'checkout' ? 'Complete Payment' : 'Booking Details'}
                            </h3>
                            <button
                                onClick={() => setSelectedService(null)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            {paymentStatus === 'success' ? (
                                <div className="text-center py-6 animate-in zoom-in-95 duration-300">
                                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs font-semibold mb-3">
                                        <ShieldCheck size={14} />
                                        Verified via Cashfree
                                    </div>
                                    <h4 className="text-2xl font-black mb-1 text-gray-900 dark:text-white">Booking Confirmed!</h4>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                                        Thank you <strong className="text-gray-900 dark:text-white">{fullName}</strong>! Your 1:1 session for <strong className="text-violet-600 dark:text-violet-400">{selectedService.title}</strong> has been booked.
                                    </p>

                                    <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 mb-5 text-left space-y-2 text-xs">
                                        <div className="flex justify-between items-center py-1 border-b border-gray-200 dark:border-gray-700">
                                            <span className="text-gray-500">Amount Paid</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{selectedService.price}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1 border-b border-gray-200 dark:border-gray-700">
                                            <span className="text-gray-500">Confirmation Sent To</span>
                                            <span className="font-medium text-gray-900 dark:text-white truncate max-w-[180px]">{email}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1">
                                            <span className="text-gray-500">Phone / WhatsApp</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{phone}</span>
                                        </div>
                                    </div>

                                    <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-900/40 p-4 rounded-xl mb-6 text-left">
                                        <p className="text-xs text-violet-900 dark:text-violet-200 font-bold mb-1.5 flex items-center gap-1.5">
                                            <Calendar size={14} /> What happens next?
                                        </p>
                                        <ul className="text-xs text-violet-800 dark:text-violet-300 space-y-1">
                                            <li>• You'll receive a confirmation receipt at <strong>{email}</strong></li>
                                            <li>• Pick a date & time that suits you using the scheduler below</li>
                                            <li>• Detailed preparation instructions will be shared before the call</li>
                                        </ul>
                                    </div>

                                    {process.env.NEXT_PUBLIC_CALENDLY_URL && (
                                        <a
                                            href={`${process.env.NEXT_PUBLIC_CALENDLY_URL}${process.env.NEXT_PUBLIC_CALENDLY_URL.includes('?') ? '&' : '?'}name=${encodeURIComponent(fullName)}&email=${encodeURIComponent(email)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full py-3.5 mb-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-center transition-all shadow-lg shadow-violet-500/20"
                                        >
                                            Schedule Your Session
                                        </a>
                                    )}

                                    <button
                                        onClick={() => setSelectedService(null)}
                                        className="w-full py-3.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl font-bold transition-all"
                                    >
                                        Back to Mentorship
                                    </button>
                                </div>
                            ) : paymentStatus === 'checkout' ? (
                                <div className="space-y-5 animate-in slide-in-from-right-8 duration-300">
                                    {/* Service & Price Summary Card */}
                                    <div className="bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-indigo-500/10 dark:from-violet-950/40 dark:to-gray-900 p-4 rounded-2xl border border-violet-200 dark:border-violet-800/50">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="text-[11px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">Selected Service</span>
                                                <h4 className="font-bold text-lg text-gray-900 dark:text-white">{selectedService.title}</h4>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[11px] font-medium text-gray-500 block">Total Payable</span>
                                                <span className="font-black text-2xl text-violet-600 dark:text-violet-400">{selectedService.price}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 pt-2 border-t border-violet-100 dark:border-violet-900/30">
                                            <span className="flex items-center gap-1"><Clock size={13} /> {selectedService.duration} Session</span>
                                            <span>•</span>
                                            <span>Mentor: Ravi Barnwal</span>
                                        </div>
                                    </div>

                                    {/* Candidate Details Summary */}
                                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3.5 text-xs space-y-1.5 border border-gray-100 dark:border-gray-800">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Name</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">{fullName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Email</span>
                                            <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[200px]">{email}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Phone</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">{phone}</span>
                                        </div>
                                    </div>

                                    {/* Cashfree Gateway Trust Banner */}
                                    <div className="bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-center space-y-2.5 shadow-sm">
                                        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                            <Lock size={13} className="text-emerald-500" />
                                            <span>Secured by Cashfree Payments</span>
                                        </div>
                                        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-medium">
                                            <span className="px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold">Google Pay</span>
                                            <span className="px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold">PhonePe</span>
                                            <span className="px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold">Paytm</span>
                                            <span className="px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold">Cards & UPI</span>
                                        </div>
                                        <p className="text-[11px] text-gray-400">
                                            Supports UPI QR, NetBanking, Credit/Debit Cards with instant confirmation.
                                        </p>
                                    </div>

                                    {errorMessage && (
                                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 text-xs p-3 rounded-xl flex items-center gap-2 animate-in slide-in-from-top-2 border border-red-200 dark:border-red-900/30">
                                            <AlertCircle size={16} className="shrink-0" />
                                            <span>{errorMessage}</span>
                                        </div>
                                    )}

                                    <div className="space-y-2 pt-1">
                                        <button
                                            onClick={handlePayWithCashfree}
                                            disabled={isPaymentProcessing}
                                            className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-base"
                                        >
                                            {isPaymentProcessing ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" />
                                                    Opening Cashfree Checkout...
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard size={18} />
                                                    Pay {selectedService.price} via Cashfree
                                                </>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPaymentStatus('idle')
                                                setErrorMessage('')
                                            }}
                                            disabled={isPaymentProcessing}
                                            className="w-full py-2.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors font-medium text-center"
                                        >
                                            ← Edit Booking Details
                                        </button>
                                    </div>

                                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                                        <p className="text-[11px] text-center text-gray-400">
                                            If you are from outside India, drop a line to <a href="mailto:support@prodsnap.in" className="text-violet-600 hover:underline">support@prodsnap.in</a>.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="animate-in slide-in-from-left-10 duration-300">
                                    <div className="bg-violet-50 dark:bg-violet-900/20 px-4 py-3 rounded-xl mb-4">
                                        <div className="flex justify-between items-center gap-3">
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-base text-violet-900 dark:text-violet-100 truncate">{selectedService.title}</h4>
                                                <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                                    <Clock size={12} />
                                                    {selectedService.duration} Session
                                                </span>
                                            </div>
                                            <span className="font-bold text-lg text-violet-600 dark:text-violet-400 shrink-0">{selectedService.price}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Full Name <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => {
                                                    setFullName(e.target.value)
                                                    if (errors.fullName) setErrors(prev => ({ ...prev, fullName: undefined }))
                                                }}
                                                className={`w-full px-4 py-2.5 rounded-xl border ${errors.fullName ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-700'} bg-gray-50 dark:bg-gray-900 transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none`}
                                                placeholder="Enter your full name"
                                            />
                                            {errors.fullName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.fullName}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email Address <span className="text-red-500">*</span></label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => {
                                                    setEmail(e.target.value)
                                                    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }))
                                                }}
                                                className={`w-full px-4 py-2.5 rounded-xl border ${errors.email ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-700'} bg-gray-50 dark:bg-gray-900 transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none`}
                                                placeholder="you@example.com"
                                            />
                                            {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Phone Number <span className="text-red-500">*</span></label>
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => {
                                                    setPhone(e.target.value)
                                                    if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }))
                                                }}
                                                className={`w-full px-4 py-2.5 rounded-xl border ${errors.phone ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-700'} bg-gray-50 dark:bg-gray-900 transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none`}
                                                placeholder="+91 98765 43210"
                                            />
                                            {errors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                                LinkedIn Profile <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                                            </label>
                                            <input
                                                type="url"
                                                value={linkedin}
                                                onChange={(e) => setLinkedin(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none"
                                                placeholder="https://linkedin.com/in/your-profile"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                                Message to Mentor <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                                            </label>
                                            <textarea
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                rows={2}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none resize-none"
                                                placeholder="Any goals or context you'd like to share..."
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleProceedToPayment}
                                        className="w-full py-3.5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200 dark:shadow-none"
                                    >
                                        Proceed to Payment
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Sticky Sub-Navigation Pills */}
            <div className="sticky top-16 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 py-3 px-4 shadow-sm">
                <div className="container mx-auto max-w-6xl flex items-center justify-center gap-2 md:gap-4 overflow-x-auto text-xs md:text-sm font-bold no-scrollbar">
                    <a href="#book" className="px-4 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors whitespace-nowrap flex items-center gap-1.5">
                        <Calendar size={14} />
                        Packages & Booking
                    </a>
                    <a href="#highlights" className="px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors whitespace-nowrap flex items-center gap-1.5">
                        <Sparkles size={14} />
                        ISB (Indian School of Business) & Events
                    </a>
                    <a href="#about" className="px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors whitespace-nowrap flex items-center gap-1.5">
                        <GraduationCap size={14} />
                        About Mentor
                    </a>
                    <a href="#reviews" className="px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors whitespace-nowrap flex items-center gap-1.5">
                        <Star size={14} />
                        Mentee Reviews
                    </a>
                </div>
            </div>

            {/* Hero Profile Section */}
            <section className="relative overflow-hidden bg-white dark:bg-gray-950 py-10 md:py-16 px-4">
                <div className="container mx-auto max-w-6xl grid md:grid-cols-2 gap-10 md:gap-12 items-center">
                    <div className="order-2 md:order-1 relative">
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-bold uppercase tracking-wider mb-4">
                                <Sparkles size={14} />
                                Product Leader &amp; Career Coach
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-3 leading-tight">
                                {mentor.name}
                            </h1>
                            <p className="text-xl md:text-2xl text-violet-600 font-bold mb-4">{mentor.title}</p>
                            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed max-w-xl">
                                {mentor.bio}
                            </p>



                            <div className="flex flex-wrap gap-4">
                                <a href="#book" className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-full font-bold hover:shadow-lg hover:shadow-violet-500/25 transition-all flex items-center gap-2">
                                    <Calendar size={18} />
                                    Book 1:1 Session
                                </a>
                                <a href="#highlights" className="px-6 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-full font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition flex items-center gap-2">
                                    <Sparkles size={18} />
                                    View Speaker Highlights
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Image Column - Exactly Half in length and breadth (max-w-[210px] vs original max-w-md 448px) */}
                    <div className="order-1 md:order-2 relative flex justify-center items-center">
                        <div className="relative w-full max-w-[210px] sm:max-w-[224px]">
                            <div className="absolute inset-0 bg-gradient-to-tr from-violet-600 to-purple-400 rounded-3xl rotate-3 opacity-25 blur-xl"></div>
                            <div className="relative">
                                <img
                                    src="/ravi-headshot.jpg?v=5"
                                    alt={mentor.name}
                                    className="w-full rounded-2xl object-cover aspect-[4/5] shadow-2xl border-2 border-white/80 dark:border-gray-800/80"
                                />

                                {/* 100+ Mentees Guided Floating Badge */}
                                <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 flex items-center gap-2 z-10 whitespace-nowrap">
                                    <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
                                        <Users size={14} />
                                    </div>
                                    <div>
                                        <p className="text-base font-black text-violet-600 dark:text-violet-400 leading-none">100+</p>
                                        <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400 leading-tight">Mentees Guided</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Corporate & B-School Credibility Banner */}
            <section className="py-8 px-4 bg-gray-50/80 dark:bg-gray-900/40 border-y border-gray-100 dark:border-gray-800/60">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left">
                            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-1">Track Record & Leadership</span>
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Worked at top global tech firms & guest speaker at premier B-schools</p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-85 hover:opacity-100 transition-opacity">
                            <img src="/companies/infosys.png" alt="Infosys" className="h-8 md:h-10 w-auto object-contain dark:brightness-110" />
                            <img src="/companies/maruti-suzuki.png" alt="Maruti Suzuki" className="h-10 md:h-14 w-auto object-contain dark:brightness-110" />
                            <img src="/companies/kpmg.png" alt="KPMG" className="h-8 md:h-10 w-auto object-contain dark:brightness-110" />
                            <img src="/companies/ibm.png" alt="IBM" className="h-8 md:h-10 w-auto object-contain dark:brightness-110" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Services / Booking Section (Pushed Up for High Conversion!) */}
            <section id="book" className="py-16 md:py-20 px-4 scroll-mt-24 bg-white dark:bg-gray-950">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-12">
                        <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest bg-violet-100 dark:bg-violet-900/30 px-3 py-1 rounded-full inline-block mb-3">1:1 Guidance</span>
                        <h2 className="text-3xl md:text-4xl font-black mb-4">Select a Mentorship Package</h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Actionable feedback, tailored career strategy, and hands-on PM mock interviews.
                        </p>
                    </div>

                    {!userId ? (
                        <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-10 md:p-12 rounded-3xl border border-gray-200 dark:border-gray-700 text-center max-w-xl mx-auto shadow-xl">
                            <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mb-5 mx-auto text-violet-600">
                                <Lock size={28} />
                            </div>
                            <h3 className="text-2xl font-black mb-2">Sign In to Book & View Packages</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm leading-relaxed">
                                Sign in to explore available 1:1 session slots, resume reviews, and career strategy packages.
                            </p>
                            <button
                                onClick={() => openAuthModal()}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/20 transition-all cursor-pointer"
                            >
                                <ArrowRight size={20} />
                                Sign In to Continue
                            </button>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-8">
                            {mentor.services.map((service, i) => (
                                <div
                                    key={i}
                                    className={`relative bg-white dark:bg-gray-800 p-8 rounded-3xl border-2 ${service.popular
                                        ? 'border-violet-500 shadow-xl shadow-violet-500/10'
                                        : 'border-gray-200 dark:border-gray-700'
                                        }`}
                                >
                                    {service.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-md">
                                            Most Popular
                                        </div>
                                    )}

                                    <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-4 text-sm">
                                        <Clock size={16} />
                                        <span>{service.duration}</span>
                                    </div>

                                    <div className="text-3xl font-black text-violet-600 mb-6">{service.price}</div>

                                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed">{service.description}</p>

                                    <ul className="space-y-3 mb-8">
                                        {service.features.map((feature, j) => (
                                            <li key={j} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                <CheckCircle size={16} className="text-green-500 shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        onClick={() => handleBookNow(service)}
                                        className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${service.popular
                                            ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:shadow-lg'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        <Calendar size={18} />
                                        Book Now
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Mentorship in Action Gallery */}
            <section id="highlights" className="py-16 md:py-20 px-4 scroll-mt-24 bg-gray-50/50 dark:bg-gray-900/30 border-y border-gray-100 dark:border-gray-800">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-bold uppercase tracking-wider mb-3">
                            <Sparkles size={14} />
                            Keynotes & Panel Discussions
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black mb-3">
                            Mentorship in Action
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Guiding students at premier B-schools like ISB (Indian School of Business) & IIMs into high-growth Product Management careers.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Highlight 1: ISB Panel Discussion (Featured Large Card) */}
                        <div className="lg:col-span-2 group relative overflow-hidden rounded-3xl h-[380px] shadow-lg border border-gray-100 dark:border-gray-800">
                            <img
                                src="/isb-panel-discussion.jpg"
                                alt="Panel Discussion for ISB (Indian School of Business) Hyderabad & Mohali Students"
                                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute top-4 left-4 z-10">
                                <span className="bg-violet-600/90 backdrop-blur-md text-white text-xs px-3.5 py-1.5 rounded-full font-bold shadow-md flex items-center gap-1.5">
                                    <Sparkles size={12} />
                                    ISB (Indian School of Business) Hyderabad & Mohali
                                </span>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-opacity duration-300 flex flex-col justify-end p-6 md:p-8">
                                <h3 className="text-white font-black text-xl md:text-2xl mb-1.5 group-hover:text-violet-200 transition-colors">
                                    Panel Discussion on Product Management
                                </h3>
                                <p className="text-gray-200 text-sm leading-relaxed max-w-xl">
                                    Sharing product strategy frameworks, career roadmaps, and real-world PM execution insights for ISB (Indian School of Business) Hyderabad & Mohali students.
                                </p>
                            </div>
                        </div>

                        {/* Highlight 2: ISB Students Audience / Classroom */}
                        <div className="group relative overflow-hidden rounded-3xl h-[380px] shadow-lg border border-gray-100 dark:border-gray-800">
                            <img
                                src="/isb-students-session.jpg"
                                alt="Interactive Session with ISB (Indian School of Business) Students"
                                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute top-4 left-4 z-10">
                                <span className="bg-black/60 backdrop-blur-md text-white text-xs px-3.5 py-1.5 rounded-full font-bold shadow-md">
                                    ISB (Indian School of Business) Cohort
                                </span>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-opacity duration-300 flex flex-col justify-end p-6">
                                <h3 className="text-white font-bold text-lg mb-1 group-hover:text-violet-200 transition-colors">
                                    Interactive Session with ISB (Indian School of Business) PM Students
                                </h3>
                                <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
                                    Engaging Q&A masterclass with aspiring product leaders.
                                </p>
                            </div>
                        </div>

                        {/* Highlight 3: IBM Intern Session */}
                        <div className="group relative overflow-hidden rounded-3xl h-[300px] shadow-lg border border-gray-100 dark:border-gray-800">
                            <img
                                src="/mentor-1.jpg"
                                alt="IBM Mentorship Session"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute top-4 left-4 z-10">
                                <span className="bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full font-bold">
                                    IBM
                                </span>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 flex flex-col justify-end p-6">
                                <p className="text-white font-bold text-base">Interactive Product Management session for IBM interns</p>
                            </div>
                        </div>

                        {/* Highlight 4: IIM Bodh Gaya */}
                        <div className="lg:col-span-2 group relative overflow-hidden rounded-3xl h-[300px] shadow-lg border border-gray-100 dark:border-gray-800">
                            <img
                                src="/iim-bodh-gaya-session.jpg?v=2"
                                alt="IIM Bodh Gaya Career Session"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute top-4 left-4 z-10">
                                <span className="bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full font-bold">
                                    IIM Bodh Gaya
                                </span>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 flex flex-col justify-end p-6 md:p-8">
                                <p className="text-white font-bold text-lg">Interactive career session & masterclass at IIM Bodh Gaya</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>



            {/* Workshop Spotlight Section */}
            <section className="py-16 px-4 bg-violet-50 dark:bg-slate-900/30 border-y border-gray-100 dark:border-gray-900">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid lg:grid-cols-12 gap-8 items-center bg-white dark:bg-gray-900 p-8 md:p-12 rounded-[2.5rem] border border-violet-100 dark:border-gray-800 shadow-xl">
                        <div className="lg:col-span-7 space-y-6">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                                <Sparkles size={12} className="animate-pulse" />
                                Workshop Highlight
                            </span>
                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white leading-tight">
                                Think Like a Product Manager, Build Products That Win
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm md:text-base">
                                A highlight from Ravi's interactive Product Management Workshop at **IIM Bodh Gaya** (DigiBiz). Ravi teaches practical frameworks, core product sense methodologies, and real-world case simulations to help aspiring leaders crack top-tier product roles.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <div className="px-4 py-2 bg-slate-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400">
                                    IIM Bodh Gaya Guest Lecture
                                </div>
                                <div className="px-4 py-2 bg-slate-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400">
                                    Case Study Method
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-5 relative w-full">
                            <div className="absolute inset-0 bg-violet-600/10 rounded-2xl blur-lg"></div>
                            <img
                                src="/ravi-iim-workshop.png"
                                alt="Ravi Barnwal PM Workshop at IIM Bodh Gaya"
                                className="w-full rounded-2xl shadow-lg border border-gray-250 dark:border-gray-800 relative z-10"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Accolades Section */}
            <section id="about" className="py-16 px-4 scroll-mt-24 bg-white dark:bg-gray-950">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black mb-3">About Ravi</h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Credentials and achievements driving real mentee success
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {mentor.accolades.map((accolade, i) => (
                            <div key={i} className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
                                <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 text-violet-600 rounded-full flex items-center justify-center mb-4">
                                    {accolade.icon}
                                </div>
                                <h3 className="font-bold mb-1 text-sm md:text-base">{accolade.title}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{accolade.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="reviews" className="py-16 md:py-20 px-4 scroll-mt-24 bg-gray-50/50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-800">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-12">
                        <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest bg-violet-100 dark:bg-violet-900/30 px-3 py-1 rounded-full inline-block mb-3">Mentee Stories</span>
                        <h2 className="text-3xl font-black mb-3">What Mentees Say</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Verified feedback from students across IIMs, IITs and tech companies
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mentor.testimonials
                            .slice(0, showAllTestimonials ? mentor.testimonials.length : 6)
                            .map((testimonial, i) => (
                                <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4 mb-4">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=7c3aed&color=fff&size=96&bold=true&format=svg`}
                                            alt={testimonial.name}
                                            className="w-12 h-12 rounded-full shrink-0"
                                        />
                                        <div className="min-w-0">
                                            {'linkedin' in testimonial ? (
                                                <a
                                                    href={testimonial.linkedin as string}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-bold text-gray-900 dark:text-white hover:text-violet-600 transition-colors flex items-center gap-1 truncate"
                                                >
                                                    {testimonial.name}
                                                    <svg className="w-4 h-4 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                                                    </svg>
                                                </a>
                                            ) : (
                                                <p className="font-bold text-gray-900 dark:text-white truncate">{testimonial.name}</p>
                                            )}
                                            <p className="text-sm text-violet-600 truncate">{testimonial.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex text-yellow-400 mb-3">
                                        {[...Array(testimonial.stars || 5)].map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
                                        {[...Array(5 - (testimonial.stars || 5))].map((_, j) => <Star key={j} size={14} className="text-gray-300" />)}
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 italic text-sm leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
                                </div>
                            ))}
                    </div>

                    {/* Toggle Button for Testimonials */}
                    <div className="mt-10 text-center">
                        <button
                            onClick={() => setShowAllTestimonials(!showAllTestimonials)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full font-bold text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm"
                        >
                            {showAllTestimonials ? (
                                <>
                                    Show Fewer Reviews
                                    <ChevronUp size={18} />
                                </>
                            ) : (
                                <>
                                    Show All 12 Reviews ({mentor.testimonials.length - 6} More)
                                    <ChevronDown size={18} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </section>

            {/* Direct Contact CTA */}
            <section className="py-16 px-4 bg-white dark:bg-gray-950">
                <div className="container mx-auto max-w-4xl">
                    <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-white text-center shadow-xl">
                        <h3 className="text-2xl md:text-3xl font-black mb-3">Have Questions Before Booking?</h3>
                        <p className="text-white/80 mb-8 max-w-xl mx-auto text-sm md:text-base">
                            Reach out directly on LinkedIn to discuss your specific goals and how we can tailor your mentorship.
                        </p>
                        <a
                            href={mentor.linkedIn}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-white text-violet-600 px-8 py-4 rounded-full font-bold hover:bg-white/90 transition shadow-lg text-sm md:text-base"
                        >
                            <MessageSquare size={20} />
                            Message on LinkedIn
                        </a>
                    </div>
                </div>
            </section>
        </main>
    )
}
