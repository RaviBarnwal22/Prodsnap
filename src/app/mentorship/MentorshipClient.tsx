'use client'

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import {
    Star,
    GraduationCap,
    Award,
    Calendar,
    Clock,
    CheckCircle,
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
    Sparkles
} from "lucide-react"

export default function MentorshipClient() {
    const router = useRouter()

    const [selectedService, setSelectedService] = useState<any>(null)
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false)
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'qrcode' | 'uploading' | 'success' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState('')

    // Form state
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [errors, setErrors] = useState<{ fullName?: string; email?: string; phone?: string }>({})

    // Payment proof state
    const [paymentProof, setPaymentProof] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // UPI Details
    const UPI_ID = "ravibarnwal22@okhdfcbank"
    const mentor = {
        name: "Ravi Barnwal",
        title: "Product Leader & Mentor",
        tagline: "Helping aspiring PMs crack their dream roles",
        image: "/ravi-speaker.jpg",
        linkedIn: "https://www.linkedin.com/in/barnwalravi/",
        bio: "Ravi is a Product Leader with extensive experience in building and scaling products at top-tier tech companies. His mentorship style is practical, focusing on first-principles thinking and real-world case studies.",
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
            { icon: <Mic size={20} />, title: "Guest Speaker", description: "Speaker at multiple product and tech events" },
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
                duration: "60 min",
                price: "₹1,299",
                description: "Full mock PM interview with detailed feedback on product sense, execution, and behavioral questions.",
                features: ["Real PM interview simulation", "Detailed written feedback", "Recording shared", "Follow-up tips"],
                popular: true
            },
            {
                title: "Resume Review",
                duration: "30 min",
                price: "₹499",
                description: "Deep dive into your resume to make it ATS-friendly and impactful for top-tier PM roles.",
                features: ["Line-by-line review", "ATS optimization", "Action verb enhancement", "Storytelling tips"]
            },
            {
                title: "Career Strategy",
                duration: "45 min",
                price: "₹999",
                description: "Personalized roadmap to transition into PM or grow in your current PM role.",
                features: ["Skill gap analysis", "Company targeting strategy", "Networking plan", "Resource toolkit"]
            }
        ]
    }

    const handleBookNow = (service: any) => {
        setSelectedService(service)
        setPaymentStatus('idle')
        // Reset form
        setFullName('')
        setEmail('')
        setPhone('')
        setPaymentProof(null)
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
        } else if (!emailRegex.test(email)) {
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

    const handleProceedToPay = () => {
        if (validateForm()) {
            setPaymentStatus('qrcode')
        }
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setErrorMessage('File size must be less than 5MB')
            return
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setErrorMessage('Please upload an image file')
            return
        }

        setIsUploading(true)
        const reader = new FileReader()
        reader.onload = (event) => {
            setPaymentProof(event.target?.result as string)
            setIsUploading(false)
        }
        reader.onerror = () => {
            setErrorMessage('Failed to read file')
            setIsUploading(false)
        }
        reader.readAsDataURL(file)
    }

    const getServicePrice = (priceStr: string) => {
        return parseInt(priceStr.replace(/[^0-9]/g, ''))
    }

    const handleSubmitBooking = async () => {
        if (!paymentProof) {
            setErrorMessage('Please upload payment screenshot')
            return
        }

        setPaymentStatus('uploading')
        setIsPaymentProcessing(true)

        try {
            const response = await fetch('/api/mentorship-booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: fullName,
                    email,
                    phone,
                    serviceType: selectedService.title,
                    paymentProof,
                    amount: getServicePrice(selectedService.price)
                })
            })

            const data = await response.json()

            if (response.ok) {
                setPaymentStatus('success')
            } else {
                setPaymentStatus('error')
                setErrorMessage(data.error || 'Failed to submit booking')
            }
        } catch (error) {
            setPaymentStatus('error')
            setErrorMessage('Network error. Please try again.')
        } finally {
            setIsPaymentProcessing(false)
        }
    }



    return (
        <main className="flex-grow pt-20">
            {/* Payment Modal */}
            {selectedService && (
                <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm z-[100]">
                    <div className="bg-white dark:bg-gray-800 rounded-t-3xl md:rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in slide-in-from-bottom-10 md:fade-in md:zoom-in duration-200 backdrop-blur-md">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold">
                                {paymentStatus === 'qrcode' ? 'Scan to Pay' : 'Booking Details'}
                            </h3>
                            <button
                                onClick={() => setSelectedService(null)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            {paymentStatus === 'success' ? (
                                <div className="text-center py-8">
                                    <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in spin-in-12 duration-500">
                                        <Clock size={40} />
                                    </div>
                                    <h4 className="text-2xl font-bold mb-2">Payment Under Review</h4>
                                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xs mx-auto">
                                        <span className="block mb-2">Thank you for submitting your booking request for:</span>
                                        <strong className="text-violet-600">{selectedService.title}</strong>
                                    </p>
                                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-xl mb-6 text-left">
                                        <p className="text-sm text-amber-900 dark:text-amber-100 font-medium mb-2">
                                            <strong>What happens next?</strong>
                                        </p>
                                        <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                                            <li>• Our team will verify your payment screenshot</li>
                                            <li>• You'll receive a confirmation email at <strong>{email}</strong></li>
                                            <li>• Verification typically takes 2-24 hours</li>
                                        </ul>
                                    </div>
                                    <button
                                        onClick={() => setSelectedService(null)}
                                        className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition-all"
                                    >
                                        Back to Mentorship
                                    </button>
                                </div>
                            ) : paymentStatus === 'qrcode' || paymentStatus === 'uploading' || paymentStatus === 'error' ? (
                                <div className="space-y-6 animate-in slide-in-from-right-10 duration-300">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-500 mb-4">Scan QR code using any UPI app</p>
                                        <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 inline-block mb-4 shadow-sm">
                                            <img
                                                src="/upi-qr.jpg"
                                                alt="Payment QR Code"
                                                className="w-56 h-56 object-contain mix-blend-multiply dark:mix-blend-normal"
                                            />
                                        </div>
                                        <p className="text-sm font-mono font-bold text-gray-600 dark:text-gray-400 mb-2 select-all break-all px-4">{UPI_ID}</p>
                                        <p className="font-bold text-xl text-violet-600">{selectedService.price}</p>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl space-y-4">
                                        <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500 flex items-center gap-2">
                                            <Upload size={16} />
                                            Upload Payment Screenshot
                                        </h4>

                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${paymentProof
                                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-violet-500 hover:bg-white dark:hover:bg-gray-800'
                                                }`}
                                        >
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                                disabled={isUploading}
                                            />

                                            {isUploading ? (
                                                <div className="flex flex-col items-center">
                                                    <Loader2 size={24} className="animate-spin text-violet-600 mb-2" />
                                                    <p className="text-sm font-medium">Processing image...</p>
                                                </div>
                                            ) : paymentProof ? (
                                                <div className="flex flex-col items-center text-green-600">
                                                    <CheckCircle size={32} className="mb-2" />
                                                    <p className="font-bold">Screenshot Uploaded</p>
                                                    <p className="text-xs mt-1">Click to change</p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center text-gray-500">
                                                    <Camera size={32} className="mb-2" />
                                                    <p className="font-bold text-gray-900 dark:text-white">Tap to Upload</p>
                                                    <p className="text-xs mt-1">Support: JPG, PNG</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {errorMessage && (
                                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2">
                                            <AlertCircle size={16} />
                                            {errorMessage}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleSubmitBooking}
                                        disabled={!paymentProof || isPaymentProcessing}
                                        className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200 dark:shadow-none"
                                    >
                                        {isPaymentProcessing ? (
                                            <>
                                                <Loader2 size={20} className="animate-spin" />
                                                Verifying Payment...
                                            </>
                                        ) : (
                                            <>
                                                Confirm Booking
                                                <ArrowRight size={20} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="animate-in slide-in-from-left-10 duration-300">
                                    <div className="bg-violet-50 dark:bg-violet-900/20 p-4 rounded-xl mb-6">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-lg text-violet-900 dark:text-violet-100">{selectedService.title}</h4>
                                            <span className="font-bold text-lg text-violet-600 dark:text-violet-400">{selectedService.price}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <Clock size={14} />
                                            <span>{selectedService.duration} Session</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Full Name <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => {
                                                    setFullName(e.target.value)
                                                    if (errors.fullName) setErrors(prev => ({ ...prev, fullName: undefined }))
                                                }}
                                                className={`w-full px-4 py-3 rounded-xl border ${errors.fullName ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-700'} bg-gray-50 dark:bg-gray-900 transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none`}
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
                                                className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-700'} bg-gray-50 dark:bg-gray-900 transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none`}
                                                placeholder="Enter your email"
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
                                                className={`w-full px-4 py-3 rounded-xl border ${errors.phone ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-700'} bg-gray-50 dark:bg-gray-900 transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none`}
                                                placeholder="+91 98765 43210"
                                            />
                                            {errors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone}</p>}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleProceedToPay}
                                        className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200 dark:shadow-none"
                                    >
                                        Proceed to Pay
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Profile Section */}
            <section className="relative overflow-hidden bg-white dark:bg-gray-950 py-12 md:py-20 px-4">
                <div className="container mx-auto max-w-6xl grid md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1 relative">
                        <div className="relative z-10">
                            <h1 className="text-5xl md:text-6xl font-black mb-4 leading-tight">
                                {mentor.name}
                            </h1>
                            <p className="text-xl md:text-2xl text-violet-600 font-bold mb-6">{mentor.title}</p>
                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-lg">
                                {mentor.bio}
                            </p>

                            <div className="flex flex-wrap gap-3 mb-8">
                                {mentor.skills.map((skill, i) => (
                                    <span key={i} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                        {skill}
                                    </span>
                                ))}
                            </div>

                            <div className="flex gap-4">
                                <a href="#book" className="px-8 py-3 bg-violet-600 text-white rounded-full font-bold hover:bg-violet-700 transition shadow-lg shadow-violet-500/25">
                                    View Packages
                                </a>
                                <a
                                    href={mentor.linkedIn}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-full font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                >
                                    LinkedIn Profile
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="order-1 md:order-2 relative flex justify-center">
                        <div className="relative w-full max-w-md">
                            <div className="absolute inset-0 bg-gradient-to-tr from-violet-600 to-purple-400 rounded-[2rem] rotate-3 opacity-20 blur-xl"></div>
                            <div className="relative">
                                <img
                                    src="/mentor-5.jpg"
                                    alt={mentor.name}
                                    className="w-full rounded-3xl object-cover aspect-[4/5] shadow-2xl"
                                />

                                {/* Stats Cards */}
                                <div className="absolute -left-6 top-10 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 animate-float z-10">
                                    <p className="text-2xl font-black text-violet-600">{mentor.stats.mentees}</p>
                                    <p className="text-xs text-gray-500 font-bold">Mentees Guided</p>
                                </div>

                                <div className="absolute -right-6 bottom-20 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 animate-float z-10" style={{ animationDelay: '1.5s' }}>
                                    <p className="text-2xl font-black text-green-500">{mentor.stats.successRate}</p>
                                    <p className="text-xs text-gray-500 font-bold">Success Rate</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Accolades Section */}
            <section className="bg-gray-50 dark:bg-gray-900/50 py-16 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black mb-4">About Ravi</h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Credentials and achievements that make a difference
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {mentor.accolades.map((accolade, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
                                <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 text-violet-600 rounded-full flex items-center justify-center mb-4">
                                    {accolade.icon}
                                </div>
                                <h3 className="font-bold mb-1">{accolade.title}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{accolade.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mentorship in Action Gallery */}
            <section className="py-20 px-4 bg-white dark:bg-gray-950">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black mb-4 flex items-center justify-center gap-3">
                            <Sparkles className="text-violet-600" />
                            Mentorship in Action
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Real sessions, real impact. Building the next generation of Product Leaders.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2 group relative overflow-hidden rounded-3xl h-[400px]">
                            <img
                                src="/mentor-1.jpg"
                                alt="Mentorship Session"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8">
                                <p className="text-white font-bold text-lg">Interactive Product Management session at IBM for interns</p>
                            </div>
                        </div>
                        <div className="group relative overflow-hidden rounded-3xl h-[400px]">
                            <img
                                src="/mentor-2.jpg"
                                alt="Speaking Event"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8">
                                <p className="text-white font-bold">Solving the right problem</p>
                            </div>
                        </div>
                        <div className="group relative overflow-hidden rounded-3xl h-[300px]">
                            <img
                                src="/mentor-3.jpg"
                                alt="Panel Discussion"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>
                        <div className="lg:col-span-2 group relative overflow-hidden rounded-3xl h-[300px]">
                            <img
                                src="/mentor-4.jpg"
                                alt="Large Group Session"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8">
                                <p className="text-white font-bold text-lg">Interactive career session at IIM Bodh Gaya</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Companies Worked For */}
            <section className="py-24 px-4 bg-gray-50/50 dark:bg-gray-900/20 border-y border-gray-100 dark:border-gray-800/50">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-center text-[10px] md:text-xs font-black text-gray-400 dark:text-gray-500 mb-20 uppercase tracking-[0.5em]">Professional Experience</h2>
                    <div className="flex flex-wrap items-center justify-center gap-16 md:gap-28 opacity-90 hover:opacity-100 transition-opacity duration-500">
                        {/* Infosys */}
                        <div className="h-12 md:h-16 w-auto group transition-all duration-300 hover:scale-110">
                            <img
                                src="/companies/infosys.png"
                                alt="Infosys"
                                className="h-full w-auto object-contain dark:brightness-110 dark:contrast-125 drop-shadow-sm group-hover:drop-shadow-md"
                            />
                        </div>
                        {/* Maruti Suzuki */}
                        <div className="h-16 md:h-24 w-auto group transition-all duration-300 hover:scale-110">
                            <img
                                src="/companies/maruti-suzuki.png"
                                alt="Maruti Suzuki"
                                className="h-full w-auto object-contain dark:brightness-110 dark:contrast-125 drop-shadow-sm group-hover:drop-shadow-md"
                            />
                        </div>
                        {/* KPMG */}
                        <div className="h-12 md:h-16 w-auto group transition-all duration-300 hover:scale-110">
                            <img
                                src="/companies/kpmg.png"
                                alt="KPMG"
                                className="h-full w-auto object-contain dark:brightness-110 dark:contrast-125 drop-shadow-sm group-hover:drop-shadow-md"
                            />
                        </div>
                        {/* IBM */}
                        <div className="h-12 md:h-16 w-auto group transition-all duration-300 hover:scale-110">
                            <img
                                src="/companies/ibm.png"
                                alt="IBM"
                                className="h-full w-auto object-contain dark:brightness-110 dark:contrast-125 drop-shadow-sm group-hover:drop-shadow-md"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 px-4 bg-white dark:bg-gray-950">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black mb-4">What Mentees Say</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Feedback from IIMs, IITs and top companies
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mentor.testimonials.map((testimonial, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
                                <div className="flex items-center gap-4 mb-4">
                                    {/* AI Avatar using UI Avatars API */}
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
                </div>
            </section>

            {/* Services / Booking Section */}
            <section id="book" className="py-20 px-4 scroll-mt-20 bg-gray-50 dark:bg-gray-900/50">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black mb-4">Book a Session</h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Choose a mentorship package that fits your needs. All sessions include personalized feedback and actionable insights.
                        </p>
                    </div>

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
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                                        Most Popular
                                    </div>
                                )}

                                <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-4">
                                    <Clock size={16} />
                                    <span>{service.duration}</span>
                                </div>

                                <div className="text-3xl font-black text-violet-600 mb-6">{service.price}</div>

                                <p className="text-gray-600 dark:text-gray-300 mb-6">{service.description}</p>

                                <ul className="space-y-3 mb-8">
                                    {service.features.map((feature, j) => (
                                        <li key={j} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                            <CheckCircle size={16} className="text-green-500" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handleBookNow(service)}
                                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${service.popular
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

                    {/* Direct Contact CTA */}
                    <div className="mt-16 text-center">
                        <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-white max-w-3xl mx-auto">
                            <h3 className="text-2xl md:text-3xl font-black mb-4">Have Questions?</h3>
                            <p className="text-white/80 mb-8">
                                Reach out directly on LinkedIn to discuss your goals and how I can help.
                            </p>
                            <a
                                href={mentor.linkedIn}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-white text-violet-600 px-8 py-4 rounded-full font-bold hover:bg-white/90 transition shadow-lg"
                            >
                                <MessageSquare size={20} />
                                Message on LinkedIn
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
