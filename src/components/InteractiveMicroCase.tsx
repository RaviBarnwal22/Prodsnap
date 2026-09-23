'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, ArrowRight, Loader2, RotateCcw, CheckCircle2, AlertTriangle, Target, Zap, Bot, Lock } from 'lucide-react'
import { evaluateMicroCase } from '@/app/actions'
import { AIEvaluationResponse } from '@/lib/ai/engine'
import { useAuth } from '@/components/AuthContext'
import { FREE_ATTEMPT_LIMIT } from '@/lib/constants'

interface MicroCaseItem {
    id: string
    brand: string
    category: string
    difficulty: string
    title: string
    framework: string
    sampleAnswer: string
    caseUrl: string
}

const MICRO_CASES: MicroCaseItem[] = [
    {
        id: 'zomato',
        brand: 'Zomato',
        category: 'Product Design',
        difficulty: 'Easy',
        title: 'Improve the food discovery experience for first-time Zomato users.',
        framework: 'CIRCLES Framework',
        sampleAnswer: `1. Goal: Reduce drop-off during first-time ordering by eliminating choice paralysis.
2. Target Segment: Budget-conscious college students & young working professionals ordering lunch.
3. Key Pain Points: Overwhelming menus (100+ items), hidden delivery fees, and lack of visual dish previews.
4. Proposed Solution: "Quick 3-Dish Curated Trays" under ₹199 with guaranteed 20-min delivery and 1-tap reorder.
5. North Star Metric: First-week second-order retention rate (aim for +15% uplift).`,
        caseUrl: '/practice/cmkee65df0001qtxrh6684fp8'
    },
    {
        id: 'swiggy',
        brand: 'Quick Commerce',
        category: 'Root Cause Analysis',
        difficulty: 'Medium',
        title: 'Order cancellation rate spiked by 8% on Swiggy Instamart during 7-9 PM peak. How do you diagnose it?',
        framework: '5-Whys & Metric Tree',
        sampleAnswer: `1. Clarify Scope: Isolate by geography (single dark store vs city-wide), platform (iOS vs Android), and user cohort (new vs power users).
2. Internal Funnel Analysis: Check if cancellation happens pre-packing (stockouts/SKU mismatch) or post-dispatch (delivery partner shortage).
3. External Variables: Verify extreme weather (Bengaluru rains), traffic gridlocks, or local festival surges.
4. Action Plan: Implement real-time dynamic delivery SLA buffer and auto-reassign nearest dark stores.
5. Guardrail Metric: Dark store pick-and-pack turnaround time (< 4 mins).`,
        caseUrl: '/practice'
    },
    {
        id: 'fintech',
        brand: 'Fintech',
        category: 'Growth & Strategy',
        difficulty: 'Medium',
        title: 'Design an automated savings & budgeting app for middle-class Indian families.',
        framework: 'Jobs To Be Done (JTBD)',
        sampleAnswer: `1. Core User Insight: Middle-class Indian households save after discretionary spending rather than before, leading to end-of-month cash crunches.
2. Proposed Feature: "Round-up UPI Vault" — automatically rounds off every UPI merchant transaction to nearest ₹10 and deposits surplus into high-yield digital gold / liquid funds.
3. Social Anchor: Family pooled goal (e.g., Diwali shopping / school fees) with shared visibility.
4. Monetization: 0.25% AUM management fee + partner affiliate credit card offers.
5. Success Metric: 30-day savings retention and average monthly deposit per active family.`,
        caseUrl: '/practice/cmkee65df0000qtxrdmu046lr'
    }
]

export function InteractiveMicroCase() {
    const [selectedCase, setSelectedCase] = useState<MicroCaseItem>(MICRO_CASES[0])
    const [answerText, setAnswerText] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [evaluationResult, setEvaluationResult] = useState<AIEvaluationResponse | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    // Signed-out visitors get a few real evaluations a day; these track that
    // allowance so the UI can prompt for an account instead of showing an error.
    const [limitReached, setLimitReached] = useState(false)
    const [guestTriesLeft, setGuestTriesLeft] = useState<number | null>(null)
    const { openAuthModal } = useAuth()

    const handleSelectCase = (c: MicroCaseItem) => {
        setSelectedCase(c)
        setAnswerText('')
        setEvaluationResult(null)
        setErrorMessage(null)
    }

    const handleReset = () => {
        setAnswerText('')
        setEvaluationResult(null)
        setErrorMessage(null)
        setGuestTriesLeft(null)
        // limitReached is deliberately not cleared — the daily allowance is
        // spent, and clearing the form should not appear to hand back a try.
    }

    const handleEvaluate = async () => {
        if (!answerText.trim() || answerText.trim().length < 15) {
            setErrorMessage('Please type at least a couple of sentences to run AI evaluation.')
            return
        }

        setIsLoading(true)
        setErrorMessage(null)
        setEvaluationResult(null)

        try {
            const res = await evaluateMicroCase(selectedCase.title, answerText)

            if (res.success && res.aiResponse) {
                setEvaluationResult(res.aiResponse)
                setGuestTriesLeft(res.isGuest ? res.remaining ?? null : null)
            } else if (res.limitReached) {
                // Out of free tries: an invitation, not a failure.
                setLimitReached(true)
                setGuestTriesLeft(0)
            } else {
                setErrorMessage(res.error || 'Evaluation timed out. Please try again.')
            }
        } catch (err: unknown) {
            setErrorMessage(err instanceof Error ? err.message : 'Something went wrong during evaluation.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <section id="playground" className="py-16 md:py-24 px-4 bg-gradient-to-b from-white via-violet-50/40 to-white dark:from-gray-950 dark:via-gray-900/40 dark:to-gray-950 border-y border-gray-100 dark:border-gray-800 scroll-mt-20">
            <div className="container mx-auto max-w-5xl">
                <div className="text-center max-w-2xl mx-auto mb-10">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-bold uppercase tracking-wider mb-3">
                        <Zap size={14} className="text-violet-600 dark:text-violet-400" />
                        Zero-Click Interactive Playground
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
                        Test the AI Case Engine <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600">Live</span>
                    </h2>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                        No sign-up or credit card required. Choose a PM challenge, type your answer, and experience instant AI-powered evaluation.
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6">
                    {MICRO_CASES.map((c) => {
                        const isSelected = c.id === selectedCase.id
                        return (
                            <button
                                key={c.id}
                                onClick={() => handleSelectCase(c)}
                                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                    isSelected
                                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25 scale-[1.02]'
                                        : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:border-violet-300 dark:hover:border-violet-700'
                                }`}
                            >
                                <span>{c.brand}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-md ${
                                    isSelected
                                        ? 'bg-white/20 text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                }`}>
                                    {c.category}
                                </span>
                            </button>
                        )
                    })}
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-3xl border-2 border-violet-200/80 dark:border-violet-900/50 shadow-2xl p-6 sm:p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-violet-400/10 dark:bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="mb-6 relative z-10">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-md">
                                {selectedCase.category}
                            </span>
                            <span className="text-[11px] font-bold px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-md">
                                {selectedCase.difficulty}
                            </span>
                            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                                Framework: <strong className="text-gray-700 dark:text-gray-200">{selectedCase.framework}</strong>
                            </span>
                        </div>
                        <h3 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 dark:text-white leading-snug">
                            &ldquo;{selectedCase.title}&rdquo;
                        </h3>
                    </div>

                    {!evaluationResult && (
                        <div className="space-y-4 relative z-10">
                            <div className="relative">
                                <textarea
                                    value={answerText}
                                    onChange={(e) => {
                                        setAnswerText(e.target.value)
                                        if (errorMessage) setErrorMessage(null)
                                    }}
                                    placeholder="Draft your solution using PM frameworks (Goals, Users, Pain points, Solutions, Trade-offs)..."
                                    rows={5}
                                    className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all resize-none font-sans leading-relaxed"
                                    disabled={isLoading}
                                />
                                <div className="flex items-center justify-between mt-2 px-1 text-xs text-gray-500">
                                    <span>{answerText.length} characters</span>
                                    {answerText.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={handleReset}
                                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-medium cursor-pointer flex items-center gap-1"
                                        >
                                            <RotateCcw size={12} /> Clear
                                        </button>
                                    )}
                                </div>
                            </div>

                            {limitReached ? (
                                <div className="p-5 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/40 rounded-2xl text-center">
                                    <div className="w-11 h-11 rounded-xl bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300 flex items-center justify-center mx-auto mb-3">
                                        <Lock size={20} />
                                    </div>
                                    <p className="font-black text-gray-900 dark:text-white mb-1">
                                        That&apos;s your free tries for today
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 max-w-sm mx-auto leading-relaxed">
                                        Create a free account to keep going — you get {FREE_ATTEMPT_LIMIT} full
                                        cases with detailed AI feedback, no card needed.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => openAuthModal()}
                                        className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-3 rounded-full font-bold text-sm hover:shadow-lg hover:shadow-violet-500/25 transition-all cursor-pointer"
                                    >
                                        Sign up to continue <ArrowRight size={16} />
                                    </button>
                                </div>
                            ) : errorMessage && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                                    <AlertTriangle size={15} className="shrink-0" />
                                    <span>{errorMessage}</span>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                    <Bot size={14} className="text-violet-500" /> Instant AI-Powered Evaluation Protocol
                                </p>
                                <button
                                    type="button"
                                    onClick={handleEvaluate}
                                    disabled={isLoading || limitReached}
                                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-full font-black text-sm hover:shadow-lg hover:shadow-violet-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <><Loader2 size={16} className="animate-spin" /> Evaluating with AI...</>
                                    ) : (
                                        <>Run Instant AI Evaluation <Sparkles size={16} /></>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {evaluationResult && (
                        <div className="space-y-6 relative z-10">
                            <div className="p-6 bg-gradient-to-r from-violet-50 to-blue-50 dark:from-violet-950/30 dark:to-blue-950/30 rounded-2xl border border-violet-100 dark:border-violet-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-16 h-16 rounded-2xl text-white flex flex-col items-center justify-center shrink-0 shadow-lg ${
                                        (evaluationResult.scores?.overall ? (evaluationResult.scores.overall > 5 ? evaluationResult.scores.overall / 10 : (evaluationResult.scores.overall / 5) * 10) : 0) >= 7
                                            ? 'bg-emerald-600 shadow-emerald-500/20'
                                            : (evaluationResult.scores?.overall ? (evaluationResult.scores.overall > 5 ? evaluationResult.scores.overall / 10 : (evaluationResult.scores.overall / 5) * 10) : 0) >= 4
                                            ? 'bg-violet-600 shadow-violet-500/20'
                                            : 'bg-red-500 shadow-red-500/20'
                                    }`}>
                                        <span className="text-2xl font-black leading-none">
                                            {(() => {
                                                const raw = evaluationResult.scores?.overall ?? 0;
                                                // Scores in Prodsnap prompt are 0-5 scale; normalize to 0-10
                                                const scoreOutOf10 = raw > 5 ? raw / 10 : (raw / 5) * 10;
                                                return scoreOutOf10.toFixed(1);
                                            })()}
                                        </span>
                                        <span className="text-[10px] font-bold opacity-80 mt-0.5">/ 10</span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wide">
                                            Live Assessment Completed
                                        </span>
                                        <h4 className="text-lg font-black text-gray-900 dark:text-white">
                                            {(() => {
                                                const raw = evaluationResult.scores?.overall ?? 0;
                                                const s = raw > 5 ? raw / 10 : (raw / 5) * 10;
                                                if (s >= 8) return 'Strong Problem Breakdown & Framework Execution';
                                                if (s >= 5) return 'Good Foundation with Areas for Polish';
                                                return 'Needs More Detail & Structural Framework';
                                            })()}
                                        </h4>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-violet-600 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-250 dark:border-gray-800 hover:border-violet-300 transition-colors cursor-pointer self-end md:self-center"
                                >
                                    <RotateCcw size={13} /> Try Another Answer
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                                    <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">
                                        <CheckCircle2 size={15} /> Strengths
                                    </div>
                                    <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {evaluationResult.strengths?.slice(0, 3).map((s, idx) => (
                                            <li key={idx} className="flex items-start gap-1.5">
                                                <span className="text-emerald-500 font-bold">•</span>
                                                <span>{s}</span>
                                            </li>
                                        )) || (
                                            <>
                                                <li>• Clear user segmentation focused on first-time drop-offs</li>
                                                <li>• Actionable solution targeting choice paralysis</li>
                                                <li>• Measurable North Star retention metric</li>
                                            </>
                                        )}
                                    </ul>
                                </div>

                                <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                                    <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-2">
                                        <Target size={15} /> Growth Opportunities
                                    </div>
                                    <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {evaluationResult.weaknesses?.slice(0, 3).map((w, idx) => (
                                            <li key={idx} className="flex items-start gap-1.5">
                                                <span className="text-amber-500 font-bold">•</span>
                                                <span>{w}</span>
                                            </li>
                                        )) || (
                                            <>
                                                <li>• Could explore merchant / restaurant kitchen bandwidth trade-offs</li>
                                                <li>• Consider secondary guardrail metrics (e.g. food quality complaints)</li>
                                            </>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            {/* Shown only to signed-out visitors, right after they have
                                seen real feedback — the moment they are most convinced. */}
                            {guestTriesLeft !== null && (
                                <div className="p-5 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="text-center sm:text-left">
                                        <p className="font-black text-gray-900 dark:text-white text-sm mb-0.5">
                                            Want to keep practising?
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-300">
                                            Create a free account for {FREE_ATTEMPT_LIMIT} more cases.
                                            {guestTriesLeft > 0 && (
                                                <> You have {guestTriesLeft} free {guestTriesLeft === 1 ? 'try' : 'tries'} left today.</>
                                            )}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => openAuthModal()}
                                        className="w-full sm:w-auto shrink-0 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-full font-bold text-sm hover:shadow-lg hover:shadow-violet-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        Create free account <ArrowRight size={16} />
                                    </button>
                                </div>
                            )}

                            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 dark:border-gray-800">
                                <p className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left">
                                    Want voice interview simulations, timed mocks, and 150+ real company cases?
                                </p>
                                <Link
                                    href={selectedCase.caseUrl}
                                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-full font-bold text-sm hover:shadow-lg hover:shadow-violet-500/25 transition-all flex items-center justify-center gap-2"
                                >
                                    Solve Full Case Study <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
