import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: "Practice PM Case Studies | Prodsnap Engine",
    description: "Solve 100+ product management case studies with real-time AI feedback. Practice product design, metrics, growth, and GTM strategy questions.",
    keywords: ["PM Case Study Practice", "Product Sensing Questions", "Guesstimates Practice", "Product Design Interview", "Root Cause Analysis PM", "Product Management Mock Interview"],
}

export const dynamic = "force-dynamic"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Header } from "@/components/Header"
import { Briefcase, BarChart3, TrendingUp, ArrowRight, Sparkles, ChevronLeft, Cpu, Rocket, Users, Search, Calculator, Lock, Unlock, CheckCircle } from "lucide-react"
import { getUser } from "@/lib/auth"
import { SkillRadarChart } from "@/components/SkillRadarChart"
import { getTotalAttemptCount, hasActiveSubscription } from "@/lib/subscription"
import { FREE_ATTEMPT_LIMIT } from "@/lib/constants"
import { Crown } from "lucide-react"
import { SignInButton } from "@/components/SignInButton"

// Helper for difficulty color
const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
        case 'easy': return 'text-green-500'
        case 'medium': return 'text-amber-500'
        case 'hard': return 'text-red-500'
        default: return 'text-gray-500'
    }
}

// Category configuration
const categoryConfig: Record<string, { label: string; icon: React.ReactNode; color: string; bgLight: string; bgDark: string; description: string; longDescription: string }> = {
    CONSUMER_PRODUCT_DESIGN: {
        label: "Product Design",
        icon: <Briefcase size={28} />,
        color: "text-blue-600 dark:text-blue-400",
        bgLight: "bg-blue-50/50",
        bgDark: "dark:bg-blue-900/10",
        description: "Consumer design challenges.",
        longDescription: "Master the art of designing products for the next billion users. This track covers everything from hyperlocal Indian logistics to vernacular fintech solutions."
    },
    METRICS: {
        label: "Success Metrics",
        icon: <BarChart3 size={28} />,
        color: "text-purple-600 dark:text-purple-400",
        bgLight: "bg-purple-50/50",
        bgDark: "dark:bg-purple-900/10",
        description: "Master KPIs & North Star logic.",
        longDescription: "Develop deep analytical rigor. Learn to define North Star metrics, handle metric trade-offs, and measure success for multi-faceted Indian platforms."
    },
    GROWTH_RETENTION: {
        label: "Growth Strategy",
        icon: <TrendingUp size={28} />,
        color: "text-orange-600 dark:text-orange-400",
        bgLight: "bg-orange-50/50",
        bgDark: "dark:bg-orange-900/10",
        description: "Scale & retention for real products.",
        longDescription: "Learn how to drive sustainable growth in a high-CAC market. This track focuses on habit formation, referral loops, and retention mechanics for Indian consumers."
    },
    TECH_ACUMEN: {
        label: "Tech Acumen",
        icon: <Cpu size={28} />,
        color: "text-cyan-600 dark:text-cyan-400",
        bgLight: "bg-cyan-50/50",
        bgDark: "dark:bg-cyan-900/10",
        description: "Understand the tech behind products.",
        longDescription: "Bridge the gap between product and engineering. Learn to articulate technical concepts, understand system design, and speak the language of developers."
    },
    GTM: {
        label: "Go-to-Market",
        icon: <Rocket size={28} />,
        color: "text-pink-600 dark:text-pink-400",
        bgLight: "bg-pink-50/50",
        bgDark: "dark:bg-pink-900/10",
        description: "Launch strategies that win.",
        longDescription: "Master the art of product launches. From pricing to positioning, learn how to take products to market in India's competitive landscape."
    },
    BEHAVIORAL: {
        label: "Behavioral",
        icon: <Users size={28} />,
        color: "text-indigo-600 dark:text-indigo-400",
        bgLight: "bg-indigo-50/50",
        bgDark: "dark:bg-indigo-900/10",
        description: "Ace STAR-method interviews.",
        longDescription: "Prepare for the human side of PM interviews. Practice storytelling, conflict resolution, and leadership scenarios using the STAR method."
    },
    RCA: {
        label: "Root Cause Analysis",
        icon: <Search size={28} />,
        color: "text-red-600 dark:text-red-400",
        bgLight: "bg-red-50/50",
        bgDark: "dark:bg-red-900/10",
        description: "Debug product problems like a pro.",
        longDescription: "When things break, PMs need to find out why. Learn systematic approaches to diagnosing metric drops, bugs, and user complaints."
    },
    GUESTIMATES: {
        label: "Guestimates",
        icon: <Calculator size={28} />,
        color: "text-emerald-600 dark:text-emerald-400",
        bgLight: "bg-emerald-50/50",
        bgDark: "dark:bg-emerald-900/10",
        description: "Market sizing & Fermi problems.",
        longDescription: "Sharpen your estimation skills with India-specific market sizing problems. Practice breaking down complex numbers into logical assumptions."
    }
}

export default async function PracticePage({
    searchParams,
}: {
    searchParams: Promise<{ category?: string }>
}) {
    const { category: selectedCategory } = await searchParams

    // Fetch core data in parallel to reduce sequential blocking
    const [questions, user, isSubscriptionActive, totalAttempts] = await Promise.all([
        prisma.practiceQuestion.findMany({
            orderBy: { createdAt: 'desc' }
        }),
        getUser(),
        hasActiveSubscription(),
        getTotalAttemptCount()
    ]);

    // Difficulty order for sorting
    const difficultyOrder: Record<string, number> = {
        'easy': 1,
        'Easy': 1,
        'medium': 2,
        'Medium': 2,
        'hard': 3,
        'Hard': 3
    }

    // Group questions by category and sort by difficulty
    const groupedQuestions = questions.reduce((acc, q) => {
        if (!acc[q.category]) {
            acc[q.category] = []
        }
        acc[q.category].push(q)
        return acc
    }, {} as Record<string, typeof questions>)

    // Sort each category's questions by difficulty
    Object.keys(groupedQuestions).forEach(category => {
        groupedQuestions[category].sort((a, b) => {
            const orderA = difficultyOrder[a.difficulty] || 999
            const orderB = difficultyOrder[b.difficulty] || 999
            if (orderA !== orderB) return orderA - orderB
            return a.id.localeCompare(b.id) // Stable secondary sort
        })
    })

    const categoryOrder = ['CONSUMER_PRODUCT_DESIGN', 'METRICS', 'GROWTH_RETENTION', 'TECH_ACUMEN', 'GTM', 'BEHAVIORAL', 'RCA', 'GUESTIMATES']

    const isAdmin = user?.email === 'ravibarnwal89@gmail.com' || (user as any)?.role === 'ADMIN'
    const isPremium = isSubscriptionActive || isAdmin
    const attemptsRemaining = Math.max(0, FREE_ATTEMPT_LIMIT - totalAttempts)

    // Fetch user's attempted question IDs
    let attemptedQuestionIds = new Set<string>()
    if (user) {
        const submissions = await prisma.practiceSubmission.findMany({
            where: {
                userId: user.id
            },
            select: {
                questionId: true
            }
        })
        attemptedQuestionIds = new Set(submissions.map(s => s.questionId))
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-4 pt-12 pb-12">
                {selectedCategory ? (
                    <div className="max-w-6xl mx-auto">
                        {/* Back Button & Category Header */}
                        <div className="mb-12">
                            <Link
                                href="/practice"
                                className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors mb-8 group"
                            >
                                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                Back to All Tracks
                            </Link>

                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div>
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-800 ${categoryConfig[selectedCategory]?.color}`}>
                                        {categoryConfig[selectedCategory]?.icon}
                                    </div>
                                    <h1 className="text-5xl font-black tracking-tight mb-4">
                                        {categoryConfig[selectedCategory]?.label}
                                    </h1>
                                    <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
                                        {categoryConfig[selectedCategory]?.longDescription}
                                    </p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 rounded-3xl border border-gray-100 dark:border-gray-800">
                                    <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Tracks</span>
                                    <span className="text-2xl font-black text-blue-600">{(groupedQuestions[selectedCategory] || []).length} Challenges</span>
                                </div>
                            </div>
                        </div>

                        {/* Questions List */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(groupedQuestions[selectedCategory] || []).map((q: any, index) => {
                                // FIRST CASE is always Viewable (Trial Open). Others are locked.
                                const isFirstCase = index === 0;
                                const isLocked = !isFirstCase && !isPremium;
                                const hasHitLimit = !isPremium && totalAttempts >= FREE_ATTEMPT_LIMIT;

                                return (
                                    <Link
                                        key={q.id}
                                        href={`/practice/${q.id}`}
                                        className={`group block p-8 rounded-[2rem] bg-gray-50 dark:bg-gray-900 border border-transparent hover:border-blue-500/50 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 relative overflow-hidden`}
                                    >
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            {isPremium ? (
                                                <>
                                                    {attemptedQuestionIds.has(q.id) && (
                                                        <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-green-200 dark:border-green-800 flex items-center gap-1">
                                                            <CheckCircle size={8} />
                                                            Attempted
                                                        </span>
                                                    )}
                                                    <span className="bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-violet-200 dark:border-violet-800 flex items-center gap-1">
                                                        <Crown size={8} />
                                                        Premium Access
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    {attemptedQuestionIds.has(q.id) && (
                                                        <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-green-200 dark:border-green-800 flex items-center gap-1">
                                                            <CheckCircle size={8} />
                                                            Attempted
                                                        </span>
                                                    )}
                                                    {isLocked ? (
                                                        <span className="bg-amber-100 text-amber-600 border-amber-200 dark:bg-opacity-20 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border flex items-center gap-1">
                                                            <Lock size={8} />
                                                            Premium
                                                        </span>
                                                    ) : (
                                                        <span className="bg-green-100 text-green-600 border-green-200 dark:bg-opacity-20 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border">
                                                            Solve (Trial)
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        <div className="mb-6 flex items-center justify-between">
                                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-blue-600 shadow-sm font-bold text-sm">
                                                #{index + 1}
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-current ${getDifficultyColor(q.difficulty)}`}>
                                                {q.difficulty}
                                            </span>
                                        </div>
                                        <h3 className={`text-xl font-bold mb-4 leading-tight group-hover:text-blue-600 transition-colors`}>
                                            {q.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed italic">
                                            {isPremium ? "Unlocked for unlimited practice • Go for it!" : isLocked ? "High-yield interview question • Explore details" : "Start your free attempt now"}
                                        </p>
                                        <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                                            {isLocked ? "Explore Case" : "Start Challenge"}
                                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </Link>
                                );
                            })}
                            {(groupedQuestions[selectedCategory] || []).length === 0 && (
                                <div className="col-span-full py-24 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[2.5rem]">
                                    <p className="text-gray-400 text-lg italic">More {categoryConfig[selectedCategory]?.label} tracks being formulated by experts...</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-12 gap-10 items-start max-w-7xl mx-auto">
                        {/* Categories List (Left Side) */}
                        <div className="lg:col-span-7 order-2 lg:order-1">
                            <div className="mb-10 text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-black uppercase tracking-widest mb-4 border border-blue-100 dark:border-blue-800">
                                    <Sparkles size={14} />
                                    Select Your Path
                                </div>
                                <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4">
                                    Practice <span className="text-blue-600">Engine</span>
                                </h1>
                                <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl">
                                    Pick a focus area. Each track contains hand-picked cases to test specific PM skills.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                {categoryOrder.map((category) => {
                                    const config = categoryConfig[category]
                                    const categoryQuestions = groupedQuestions[category] || []

                                    return (
                                        <Link
                                            key={category}
                                            href={`/practice?category=${category}`}
                                            className={`flex flex-col rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-500/50 ${config.bgLight} ${config.bgDark} group relative overflow-hidden`}
                                        >
                                            <div className="relative z-10 flex flex-col h-full">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white dark:bg-gray-800 shadow-lg ${config.color} group-hover:scale-110 transition-all duration-500`}>
                                                        {React.cloneElement(config.icon as React.ReactElement<any>, { size: 22 })}
                                                    </div>
                                                    <div>
                                                        <h2 className="text-2xl font-black tracking-tight leading-none group-hover:text-blue-600 transition-colors">
                                                            {config.label}
                                                        </h2>
                                                        <span className="text-xs font-black uppercase tracking-widest text-gray-400 mt-1.5 block">
                                                            {categoryQuestions.length} Case{categoryQuestions.length !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                </div>

                                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed">
                                                    {config.description}
                                                </p>

                                                <div className="mt-5 flex items-center justify-between">
                                                    <div className="text-xs font-black uppercase tracking-widest text-blue-600/50 group-hover:text-blue-600 transition-colors">
                                                        Explore Track
                                                    </div>
                                                    <div className="px-5 py-2.5 rounded-full bg-blue-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-all duration-300">
                                                        Try Now
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Skill Matrix (Right Side) */}
                        <div className="lg:col-span-5 order-1 lg:order-2 lg:sticky lg:top-24">
                            {user ? (
                                <SkillRadarChart />
                            ) : (
                                <div className="p-8 text-center bg-gray-50 dark:bg-gray-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                                    <Users size={40} className="mx-auto text-gray-300 mb-4" />
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">Unlock Skill Analytics</h3>
                                    <p className="text-xs text-gray-500 mb-5">Sign in to track performance and see your skill radar matrix.</p>
                                    <SignInButton className="inline-block bg-white dark:bg-gray-800 px-6 py-2 rounded-full font-bold text-xs shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">Sign In Now</SignInButton>
                                </div>
                            )}

                            {user && !isPremium && (
                                <div className="mt-6 inline-flex items-center gap-3 p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800 rounded-2xl w-full">
                                    <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white shadow-lg">
                                        <Sparkles size={16} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs font-black uppercase tracking-widest text-violet-600 dark:text-violet-400">Trial Usage</p>
                                        <p className="text-sm font-bold text-violet-900 dark:text-white">
                                            {attemptsRemaining} of {FREE_ATTEMPT_LIMIT} cases remaining
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Practice Tips Section */}
                            <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800">
                                <h4 className="text-base font-black text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                                    <Cpu size={18} className="text-blue-500" />
                                    Practice Tips
                                </h4>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">Focus on one category per week to build deep muscle memory.</p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">Review AI feedback thoroughly to identify recurring gaps.</p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">Use the simulation mode to practice under time pressure.</p>
                                    </li>
                                </ul>
                                <Link
                                    href="/blog"
                                    className="mt-6 flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-blue-500 transition-colors group"
                                >
                                    <span className="text-xs font-bold">Read Expert Blogs</span>
                                    <ArrowRight size={14} className="text-blue-500 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
