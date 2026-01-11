'use client'

import { useState, useEffect } from 'react'
import { AnswerForm } from '@/components/AnswerForm'
import { PremiumUpgradeModal } from '@/components/PremiumUpgradeModal'
import { canAttemptCategory, incrementCategoryAttempt } from '@/lib/subscription'
import { Crown, Lock, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface PracticeQuestionClientProps {
    questionId: string
    userId?: string
    userEmail?: string
    userName?: string
    category: string
    solutionText?: string
    sampleAnswer?: string
}

export function PracticeQuestionClient({
    questionId,
    userId,
    userEmail,
    userName,
    category,
    solutionText,
    sampleAnswer
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

    useEffect(() => {
        async function checkAttemptStatus() {
            if (!userId) {
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

        checkAttemptStatus()
    }, [category, userId])

    const handleStartAttempt = async () => {
        if (!attemptStatus?.canAttempt) {
            setShowUpgradeModal(true)
            return
        }

        // Increment attempt count when user starts
        try {
            await incrementCategoryAttempt(category)
            setHasStartedAttempt(true)
        } catch (error) {
            console.error('Error incrementing attempt:', error)
        }
    }

    if (!userId) {
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

    // If user has exceeded limit and hasn't started an attempt
    if (attemptStatus && !attemptStatus.canAttempt && !hasStartedAttempt) {
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
                        You've used {attemptStatus.attemptsUsed}/2 free attempts across all categories.
                        <br />
                        Upgrade to Premium for unlimited practice!
                    </p>
                    <button
                        onClick={() => setShowUpgradeModal(true)}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all"
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
    const showAttemptBanner = attemptStatus && !attemptStatus.isPremium && !hasStartedAttempt

    return (
        <>
            {/* Attempt Status Banner */}
            {showAttemptBanner && (
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Sparkles size={20} className="text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            Free Attempts: {attemptStatus.attemptsRemaining}/2 remaining (across all categories)
                        </span>
                    </div>
                    <button
                        onClick={() => setShowUpgradeModal(true)}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                        <Crown size={14} />
                        Go Premium
                    </button>
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
            {!hasStartedAttempt && attemptStatus?.canAttempt ? (
                <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border shadow-sm text-center">
                    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                        Ready to Practice?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Click below to start your attempt. This will count as one of your practice attempts.
                    </p>
                    <button
                        onClick={handleStartAttempt}
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                    >
                        Start Practice
                    </button>
                </div>
            ) : hasStartedAttempt || attemptStatus?.isPremium ? (
                <AnswerForm
                    questionId={questionId}
                    userId={userId}
                    solutionText={solutionText}
                    sampleAnswer={sampleAnswer}
                />
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
