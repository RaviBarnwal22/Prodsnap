'use client'

import { useState, useEffect, useRef } from 'react'
import { AnswerForm } from '@/components/AnswerForm'
import { PremiumUpgradeModal } from '@/components/PremiumUpgradeModal'
import { canAttemptCategory, incrementCategoryAttempt } from '@/lib/subscription'
import { FREE_ATTEMPT_LIMIT } from '@/lib/constants'
import { Crown, Lock, Sparkles, Clock, CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface PracticeQuestionClientProps {
    questionId: string
    questionTitle: string
    userId?: string
    userEmail?: string
    userName?: string
    category: string
    description: string
    solutionText?: string
    sampleAnswer?: string
    previousSubmission?: {
        answerText: string
        aiScore?: string
        createdAt: string
    }
    history?: {
        id: string
        answerText: string
        aiScore?: string
        createdAt: string
    }[]
    isLocked?: boolean
}

export function PracticeQuestionClient({
    questionId,
    questionTitle,
    userId,
    userEmail,
    userName,
    category,
    description,
    solutionText,
    sampleAnswer,
    previousSubmission,
    history = [],
    isLocked = false
}: PracticeQuestionClientProps) {
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)
    const [attemptStatus, setAttemptStatus] = useState<{
        canAttempt: boolean
        attemptsUsed: number
        attemptsRemaining: number
        isPremium: boolean
    } | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [hasStartedAttempt, setHasStartedAttempt] = useState(false)
    const [startTime, setStartTime] = useState<number | null>(null)
    const [elapsedTime, setElapsedTime] = useState(0)
    const [isFinished, setIsFinished] = useState(false)
    const [isStarting, setIsStarting] = useState(false)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    // State for client-side user fetching (fallback if server props are missing)
    const [clientUser, setClientUser] = useState<{ id: string; email?: string; name?: string } | null>(null)

    // Resolve final user data efficiently
    const finalUserId = userId || clientUser?.id
    const finalUserEmail = userEmail || clientUser?.email
    const finalUserName = userName || clientUser?.name

    // Effect: Fetch user client-side if missing from props
    useEffect(() => {
        if (!userId) {
            const fetchClientUser = async () => {
                const { createClient } = await import('@/lib/supabase/client')
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()

                if (user) {
                    setClientUser({
                        id: user.id,
                        email: user.email,
                        name: user.user_metadata?.full_name
                    })
                }
            }
            fetchClientUser()
        }
    }, [userId])

    useEffect(() => {
        async function checkAttemptStatus() {
            if (!finalUserId) {
                // If we are still loading client user, don't stop yet
                if (!userId && isLoading) return
                setIsLoading(false)
                return
            }

            try {
                const status = await canAttemptCategory(category)
                setAttemptStatus(status)
            } catch (error) {
                console.error('Error checking attempt status:', error)
            } finally {
                setIsLoading(false)
            }
        }

        if (finalUserId) {
            checkAttemptStatus()
        } else if (!userId) {
            // Allow a small delay for client fetch to kick in before showing "Please sign in"
            setTimeout(() => setIsLoading(false), 2000)
        }
    }, [category, finalUserId, userId, isLoading])

    // Auto-load if previous submission exists
    useEffect(() => {
        if (previousSubmission && !hasStartedAttempt) {
            setHasStartedAttempt(true)
            setIsFinished(true)
            setElapsedTime(0)
            setStartTime(null)
        }
    }, [previousSubmission])

    // Timer effect
    useEffect(() => {
        if (hasStartedAttempt && startTime && !isFinished) {
            timerRef.current = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
            }, 1000)
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [hasStartedAttempt, startTime, isFinished])

    const handleStartAttempt = async () => {
        // If previous submission exists, this is a free re-attempt
        if (previousSubmission) {
            setHasStartedAttempt(true)
            setStartTime(null) // Don't start the clock yet
            setElapsedTime(0)
            setIsFinished(true) // Mark as "finished" (viewing result mode)
            return
        }

        if (!attemptStatus?.canAttempt) {
            setShowUpgradeModal(true)
            return
        }

        // Increment attempt count when user starts
        setIsStarting(true)
        try {
            await incrementCategoryAttempt(category)
            setHasStartedAttempt(true)
            setStartTime(Date.now())
            setElapsedTime(0)
            setIsFinished(false)
        } catch (error) {
            console.error('Error incrementing attempt:', error)
        } finally {
            setIsStarting(false)
        }
    }

    const handleRetry = () => {
        setStartTime(Date.now())
        setElapsedTime(0)
        setIsFinished(false)
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // Only show "Please sign in" if we've finished loading and truly have no user
    if (!finalUserId && !isLoading) {
        return (
            <div className="bg-blue-50 border-blue-200 border p-6 rounded-lg text-center">
                <p className="mb-4 text-blue-800">Please sign in to practice and get AI feedback.</p>
                <Link href="/login" className="inline-block bg-blue-600 text-white px-6 py-2 rounded">
                    Sign In
                </Link>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border shadow-sm">
                <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                    <span className="text-gray-500">Loading...</span>
                </div>
            </div>
        )
    }

    // If it's a PREMIUM LOCKED case
    if (isLocked) {
        return (
            <>
                <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-200 dark:border-gray-800 p-12 text-center flex flex-col items-center justify-center min-h-[500px] shadow-2xl relative overflow-hidden group">
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600"></div>
                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl group-hover:bg-violet-500/10 transition-colors"></div>

                    <div className="relative z-10 max-w-md">
                        <div className="w-24 h-24 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl mx-auto rotate-3 group-hover:rotate-0 transition-transform duration-500">
                            <Crown size={48} className="text-white" />
                        </div>
                        <h2 className="text-4xl font-black mb-4 tracking-tight">Unlock This Case</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg mb-10 leading-relaxed font-medium">
                            This is a high-yield premium case used in actual interviews at Tier-1 companies. Upgrade to practice with our AI Interviewer.
                        </p>

                        <div className="space-y-4 w-full">
                            <button
                                onClick={() => setShowUpgradeModal(true)}
                                className="block w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-black text-lg hover:scale-[1.02] transition-transform shadow-xl"
                            >
                                Get Premium Access
                            </button>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
                                Unlocks 50+ Real Interview Questions
                            </p>
                        </div>
                    </div>
                </div>

                <PremiumUpgradeModal
                    isOpen={showUpgradeModal}
                    onClose={() => setShowUpgradeModal(false)}
                    category={category}
                    attemptsUsed={attemptStatus?.attemptsUsed || 0}
                    userEmail={userEmail}
                    userName={userName}
                />
            </>
        )
    }

    // If user has exceeded limit and hasn't started an attempt
    // AND they have NOT previously solved this (if they have, they can re-attempt)
    if (attemptStatus && !attemptStatus.canAttempt && !hasStartedAttempt && !previousSubmission) {
        return (
            <>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 p-8 rounded-2xl text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center">
                        <Lock size={28} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                        Free Attempts Exhausted
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        You've used {attemptStatus.attemptsUsed}/{FREE_ATTEMPT_LIMIT} free attempts across all categories.
                        <br />
                        Upgrade to Premium for unlimited practice!
                    </p>
                    <button
                        onClick={() => setShowUpgradeModal(true)}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/30 transition-all"
                    >
                        <Crown size={18} />
                        Upgrade to Premium - ₹199/month
                    </button>
                </div>

                <PremiumUpgradeModal
                    isOpen={showUpgradeModal}
                    onClose={() => setShowUpgradeModal(false)}
                    category={category}
                    attemptsUsed={attemptStatus.attemptsUsed}
                    userEmail={userEmail}
                    userName={userName}
                />
            </>
        )
    }

    // Show attempt status banner for free users
    const showAttemptBanner = attemptStatus && !attemptStatus.isPremium && !hasStartedAttempt && !previousSubmission

    return (
        <>
            {/* Attempt Status Banner */}
            {showAttemptBanner && (
                <div className="mb-4 p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Sparkles size={20} className="text-violet-600 dark:text-violet-400" />
                        <span className="text-sm font-medium text-violet-800 dark:text-violet-200">
                            Free Attempts: {attemptStatus.attemptsRemaining}/{FREE_ATTEMPT_LIMIT} remaining (across all categories)
                        </span>
                    </div>
                    <button
                        onClick={() => setShowUpgradeModal(true)}
                        className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
                    >
                        <Crown size={14} />
                        Go Premium
                    </button>
                </div>
            )}

            {/* Previously Solved Banner */}
            {previousSubmission && !hasStartedAttempt && (
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
                    <CheckCircle2 size={20} className="text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                        You have already solved this case. Re-attempts are free!
                    </span>
                </div>
            )}

            {/* Premium Badge */}
            {attemptStatus?.isPremium && (
                <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-3">
                    <Crown size={20} className="text-amber-500" />
                    <span className="text-sm font-bold text-amber-800 dark:text-amber-200">
                        Premium Member - Unlimited Practice
                    </span>
                </div>
            )}

            {/* Show start button or answer form */}
            {!hasStartedAttempt && (attemptStatus?.canAttempt || previousSubmission) ? (
                <div className="space-y-6">
                    {/* Simulation Note */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-6 rounded-[1.5rem] flex items-start gap-4 shadow-sm">
                        <div className="bg-blue-600 text-white p-2 rounded-xl shrink-0">
                            <Sparkles size={18} />
                        </div>
                        <div>
                            <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed font-medium">
                                <span className="font-black uppercase text-[10px] tracking-widest block mb-1.5 opacity-70">Case Simulation Mode</span>
                                You are about to enter a live interview simulation. Just like a real-world product interview, you can ask for context using the <strong className="text-blue-900 dark:text-blue-100 font-black">Interviewer Hub</strong> after starting. Gather your thoughts, clarify the goals, and then submit your response for a detailed AI critique.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border shadow-sm text-center">
                        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                            {previousSubmission ? "Want to try again?" : "Ready to Practice?"}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {previousSubmission
                                ? "This will safely replace your display answer without using your daily attempts."
                                : "Click below to start your attempt. This will count as one of your practice attempts."
                            }
                        </p>
                        <button
                            onClick={handleStartAttempt}
                            disabled={isStarting}
                            className={`text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 mx-auto min-w-[200px] ${previousSubmission ? "bg-emerald-600 hover:bg-emerald-700" : "bg-violet-600 hover:bg-violet-700"
                                } ${isStarting ? 'opacity-80 cursor-wait' : ''}`}
                        >
                            {isStarting ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Setting Up...
                                </>
                            ) : (
                                previousSubmission ? "View Previous Try (Free)" : "Start Practice"
                            )}
                        </button>
                    </div>
                </div>
            ) : hasStartedAttempt || attemptStatus?.isPremium ? (
                <>
                    {/* Timer Display */}
                    {hasStartedAttempt && (
                        <div className="mb-4 p-4 bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 border border-violet-200 dark:border-violet-800 rounded-xl flex items-center justify-center gap-3">
                            <Clock size={20} className="text-violet-600 dark:text-violet-400" />
                            <span className="text-lg font-mono font-bold text-violet-800 dark:text-violet-200">
                                Time Elapsed: {formatTime(elapsedTime)}
                            </span>
                        </div>
                    )}
                    <AnswerForm
                        questionId={questionId}
                        questionTitle={questionTitle}
                        userId={userId}
                        category={category}
                        description={description}
                        solutionText={solutionText}
                        sampleAnswer={sampleAnswer}
                        elapsedTime={elapsedTime}
                        onSubmitted={() => setIsFinished(true)}
                        onRetry={handleRetry}
                        previousSubmission={previousSubmission}
                        isPremium={attemptStatus?.isPremium}
                    />
                </>
            ) : null}

            <PremiumUpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                category={category}
                attemptsUsed={attemptStatus?.attemptsUsed || 0}
                userEmail={userEmail}
                userName={userName}
            />
        </>
    )
}
