'use client'

import { useState, useEffect } from 'react'
import { AnswerForm } from './AnswerForm'
import { createClient } from '@/lib/supabase/client'
import { Lock, Crown, Loader2, Sparkles, CheckCircle2, Clock, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { PremiumUpgradeModal } from './PremiumUpgradeModal'

interface PracticeQuestionClientProps {
    questionId: string
    questionTitle: string
    category: string
    description: string
    userId?: string
    solutionText?: string
    sampleAnswer?: string
    isLocked: boolean
    isPremium?: boolean
    userEmail?: string
    userName?: string
    previousSubmission?: {
        answerText: string
        aiScore?: string
        createdAt: string
    }
    history?: any[]
    initialResult?: any
}

const FREE_ATTEMPT_LIMIT = 3

export function PracticeQuestionClient({
    questionId,
    questionTitle,
    category,
    description,
    userId: initialUserId,
    solutionText,
    sampleAnswer,
    isLocked,
    isPremium: initialIsPremium = false,
    userEmail,
    userName,
    previousSubmission: initialPreviousSubmission,
    history = []
}: PracticeQuestionClientProps) {
    const [userId, setUserId] = useState<string | null>(initialUserId || null)
    const [isLoading, setIsLoading] = useState(true)
    const [hasStartedAttempt, setHasStartedAttempt] = useState(!!initialPreviousSubmission?.aiScore)
    const [elapsedTime, setElapsedTime] = useState(0)
    const [isFinished, setIsFinished] = useState(!!initialPreviousSubmission?.aiScore)
    const [isStarting, setIsStarting] = useState(false)
    const [attemptStatus, setAttemptStatus] = useState<{
        attemptsUsed: number
        attemptsRemaining: number
        canAttempt: boolean
        isPremium: boolean
    } | null>(null)
    const [previousSubmission, setPreviousSubmission] = useState<{
        id?: string
        answerText: string
        aiScore?: string
        createdAt: string
    } | null>(initialPreviousSubmission || null)
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)

    useEffect(() => {
        const checkAuthAndStatus = async () => {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()
            const finalUserId = session?.user?.id || null
            setUserId(finalUserId)

            // Initialize attempt status based on SSR props
            setAttemptStatus(prev => ({
                attemptsUsed: prev?.attemptsUsed || 0,
                attemptsRemaining: prev?.attemptsRemaining || 999,
                canAttempt: true,
                isPremium: initialIsPremium
            }))

            // Restore draft (including timer)
            if (typeof window !== 'undefined') {
                const draftKey = `draft_${questionId}`
                const draft = localStorage.getItem(draftKey) || localStorage.getItem('pending_answer') // check both for compatibility
                if (draft) {
                    try {
                        const parsed = JSON.parse(draft)
                        if (parsed.qId === questionId || parsed.questionId === questionId) {
                            if (parsed.elapsedTime) setElapsedTime(parsed.elapsedTime)
                            setHasStartedAttempt(true)
                        }
                    } catch (e) { console.error("Error restoring draft", e) }
                }
            }

            if (finalUserId) {
                try {
                    if (initialPreviousSubmission) {
                        setPreviousSubmission(initialPreviousSubmission)
                    }
                } catch (err) {
                    console.error("Error fetching status:", err)
                }
            }
            setIsLoading(false)
        }
        checkAuthAndStatus()
    }, [category, questionId, initialPreviousSubmission])

    useEffect(() => {
        let interval: NodeJS.Timeout
        if (hasStartedAttempt && !isFinished) {
            interval = setInterval(() => {
                setElapsedTime((prev) => {
                    const nextTime = prev + 1
                    // Persist timer periodically
                    if (nextTime % 5 === 0) {
                        const draftKey = `draft_${questionId}`
                        const existing = localStorage.getItem(draftKey)
                        if (existing) {
                            try {
                                const parsed = JSON.parse(existing)
                                parsed.elapsedTime = nextTime
                                localStorage.setItem(draftKey, JSON.stringify(parsed))
                            } catch (e) { /* ignore */ }
                        }
                    }
                    return nextTime
                })
            }, 1000)
        }
        return () => {
            if (interval) clearInterval(interval)
        }
    }, [hasStartedAttempt, isFinished, questionId])

    const handleStartAttempt = async () => {
        console.log('[handleStartAttempt] called, userId:', userId, 'isLocked:', isLocked)

        if (!userId) {
            // Guests can start the attempt to explore, but can't save/get AI feedback without login
            console.log('[handleStartAttempt] Guest mode - setting hasStartedAttempt to true')
            setHasStartedAttempt(true)
            return
        }

        setIsStarting(true)
        try {
            const res = await fetch('/api/start-attempt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category })
            })

            if (res.ok) {
                setHasStartedAttempt(true)
            } else {
                const data = await res.json()
                if (data.error === 'Attempt limit reached') {
                    setShowUpgradeModal(true)
                }
            }
        } catch (err) {
            console.error("Error starting attempt:", err)
        } finally {
            setIsStarting(false)
        }
    }

    const handleRetry = () => {
        setElapsedTime(0)
        setIsFinished(false)
        setHasStartedAttempt(true) // Immediately start on retry
    }

    // Auto-start logic handled in main effect

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border shadow-sm flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={40} className="animate-spin text-blue-600" />
                    <span className="text-gray-500 font-medium">Preparing Case Simulation...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Guest Banner - only show on unlocked cases */}
            {!userId && !isLocked && !hasStartedAttempt && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-6 rounded-[2rem] flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-600 text-white p-2 rounded-xl">
                            <Sparkles size={18} />
                        </div>
                        <p className="text-blue-800 dark:text-blue-200 text-sm font-medium">
                            Explore the simulation as a guest. <strong>Sign in to save progress.</strong>
                        </p>
                    </div>
                    <Link href="/login" className="text-xs font-black uppercase tracking-widest text-blue-600 hover:underline">
                        Sign In
                    </Link>
                </div>
            )}

            {/* Locked Case - Guest: Must sign in first */}
            {isLocked && !userId && (
                <div className="bg-white dark:bg-gray-900 p-12 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl text-center relative overflow-hidden">
                    <div className="absolute inset-0 backdrop-blur-sm bg-white/60 dark:bg-gray-900/60 z-10"></div>
                    <div className="relative z-20 flex flex-col items-center justify-center min-h-[300px]">
                        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-3xl flex items-center justify-center mb-6 text-amber-600">
                            <Lock size={32} />
                        </div>
                        <h2 className="text-2xl font-black mb-3 tracking-tight">Premium Case</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-base mb-8 leading-relaxed font-medium max-w-sm mx-auto">
                            Sign in to your account first. Then upgrade to Premium to unlock all cases and detailed AI evaluations.
                        </p>
                        <Link
                            href={`/login?redirectedFrom=/practice/${questionId}`}
                            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-lg hover:scale-[1.02] transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2"
                        >
                            Sign In to Continue
                            <ChevronRight size={20} />
                        </Link>
                    </div>
                </div>
            )}

            {/* Locked Case - Logged in but not premium: Show upgrade */}
            {isLocked && userId && !attemptStatus?.isPremium && (
                <div className="bg-white dark:bg-gray-900 p-12 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl text-center relative overflow-hidden">
                    <div className="absolute inset-0 backdrop-blur-sm bg-white/60 dark:bg-gray-900/60 z-10"></div>
                    <div className="relative z-20 flex flex-col items-center justify-center min-h-[300px]">
                        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-3xl flex items-center justify-center mb-6 text-amber-600">
                            <Crown size={32} />
                        </div>
                        <h2 className="text-2xl font-black mb-3 tracking-tight">Premium Case</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-base mb-8 leading-relaxed font-medium max-w-sm mx-auto">
                            Upgrade to Premium to unlock all cases, get detailed AI-powered feedback, and track your progress.
                        </p>
                        <button
                            onClick={() => setShowUpgradeModal(true)}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-4 rounded-2xl font-black text-lg hover:scale-[1.02] transition-all shadow-xl shadow-amber-500/20 flex items-center gap-2"
                        >
                            <Crown size={20} />
                            Upgrade to Premium
                        </button>
                    </div>
                </div>
            )}

            {/* Previously Solved Banner */}
            {!isLocked && previousSubmission && !hasStartedAttempt && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 size={20} className="text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">
                            You have already solved this case.
                        </span>
                    </div>
                    {previousSubmission.aiScore && (
                        <button
                            onClick={() => {
                                setHasStartedAttempt(true);
                                setIsFinished(true);
                            }}
                            className="text-xs font-bold text-green-600 hover:text-green-700 bg-white px-3 py-1.5 rounded-lg border border-green-200 shadow-sm transition-all"
                        >
                            View Evaluation
                        </button>
                    )}
                </div>
            )}

            {/* Main Content Area - Only show if not locked and not already solved */}
            {!isLocked && !hasStartedAttempt && !previousSubmission && (
                <div className="bg-white dark:bg-gray-900 p-12 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl text-center relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors"></div>

                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center mb-8 mx-auto text-blue-600 dark:text-blue-400 transform group-hover:scale-110 transition-transform">
                            <Sparkles size={32} />
                        </div>
                        <h2 className="text-3xl font-black mb-4 tracking-tight">
                            {previousSubmission ? "Polish Your Strategy" : "Ready to Solve?"}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg mb-10 leading-relaxed font-medium max-w-md mx-auto">
                            Step into the role of a Product Manager at your dream company. Clarify the case, frame your thinking, and get industry-standard feedback.
                        </p>

                        <div className="flex flex-col items-center gap-4">
                            <button
                                type="button"
                                onClick={handleStartAttempt}
                                disabled={isStarting}
                                className="w-full max-w-xs bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:scale-[1.02] transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer relative z-20"
                            >
                                {isStarting ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Preparing...
                                    </>
                                ) : (
                                    <>
                                        {previousSubmission ? "Retry Challenge" : "Start Simulation"}
                                        <ChevronRight size={20} />
                                    </>
                                )}
                            </button>
                            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-500" /> AI Feedback</span>
                                <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-500" /> Professional Frameworks</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Active Simulation */}
            {!isLocked && hasStartedAttempt && (
                <div className="space-y-6">
                    {/* Timer - only show when not finished */}
                    {!isFinished && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-center gap-3">
                            <Clock size={20} className="text-gray-400" />
                            <span className="text-lg font-mono font-bold text-gray-600 dark:text-gray-300">
                                Time Elapsed: {formatTime(elapsedTime)}
                            </span>
                        </div>
                    )}

                    <AnswerForm
                        questionId={questionId}
                        questionTitle={questionTitle}
                        userId={userId || undefined}
                        category={category}
                        description={description}
                        solutionText={solutionText}
                        sampleAnswer={sampleAnswer}
                        elapsedTime={elapsedTime}
                        onSubmitted={() => setIsFinished(true)}
                        onRetry={handleRetry}
                        previousSubmission={previousSubmission || undefined}
                        isPremium={initialIsPremium}
                        initialResult={previousSubmission?.aiScore ? JSON.parse(previousSubmission.aiScore) : undefined}
                    />
                </div>
            )}

            <PremiumUpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                category={category}
                attemptsUsed={attemptStatus?.attemptsUsed || 0}
                userEmail={userEmail}
                userName={userName}
            />
        </div>
    )
}
