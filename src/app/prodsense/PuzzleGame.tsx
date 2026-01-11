'use client'

import { useState, useEffect } from 'react'
import { Flame, Clock, CheckCircle, XCircle, Zap, Trophy, Target, Sparkles, ChevronRight } from 'lucide-react'
import { submitPuzzleAnswer } from './actions'

interface Puzzle {
    id: string
    question: string
    context: string | null
    optionA: string
    optionB: string
    optionC: string
    optionD: string | null
    category: string
    difficulty: string
}

interface Streak {
    currentStreak: number
    longestStreak: number
    totalCorrect: number
    totalPlayed: number
}

interface PuzzleGameProps {
    puzzle: Puzzle
    streak: Streak | null
    hasAttempted: boolean
    previousAttempt: {
        answer: string
        isCorrect: boolean
    } | null
    isLoggedIn: boolean
}

const categoryColors: Record<string, string> = {
    'USER_BEHAVIOR': 'bg-purple-100 text-purple-700',
    'METRICS': 'bg-blue-100 text-blue-700',
    'STRATEGY': 'bg-amber-100 text-amber-700',
    'GROWTH': 'bg-green-100 text-green-700'
}

const difficultyColors: Record<string, string> = {
    'Easy': 'bg-green-500',
    'Medium': 'bg-amber-500',
    'Hard': 'bg-red-500'
}

export function PuzzleGame({ puzzle, streak, hasAttempted, previousAttempt, isLoggedIn }: PuzzleGameProps) {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(previousAttempt?.answer || null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [result, setResult] = useState<{
        isCorrect: boolean
        correctAnswer: string
        explanation: string
        newStreak: number
    } | null>(null)
    const [timeElapsed, setTimeElapsed] = useState(0)
    const [showExplanation, setShowExplanation] = useState(hasAttempted)

    // Timer effect
    useEffect(() => {
        if (hasAttempted || result) return

        const timer = setInterval(() => {
            setTimeElapsed(t => t + 1)
        }, 1000)

        return () => clearInterval(timer)
    }, [hasAttempted, result])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const handleSubmit = async () => {
        if (!selectedAnswer || !isLoggedIn) return

        setIsSubmitting(true)
        const response = await submitPuzzleAnswer(puzzle.id, selectedAnswer, timeElapsed)

        if (response.success) {
            setResult({
                isCorrect: response.isCorrect!,
                correctAnswer: response.correctAnswer!,
                explanation: response.explanation!,
                newStreak: response.newStreak!
            })
            setShowExplanation(true)
        }
        setIsSubmitting(false)
    }

    const options = [
        { key: 'A', text: puzzle.optionA },
        { key: 'B', text: puzzle.optionB },
        { key: 'C', text: puzzle.optionC },
        ...(puzzle.optionD ? [{ key: 'D', text: puzzle.optionD }] : [])
    ]

    const isComplete: boolean = Boolean(hasAttempted || result)

    return (
        <div className="space-y-8">
            {/* Streak Banner */}
            <div className="flex flex-wrap gap-4 justify-center">
                <div className="flex items-center gap-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-2xl shadow-lg shadow-orange-500/20">
                    <Flame className="animate-pulse" size={24} />
                    <div>
                        <div className="text-2xl font-black">{streak?.currentStreak || 0}</div>
                        <div className="text-[10px] uppercase tracking-widest opacity-80">Day Streak</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-6 py-3 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <Trophy className="text-amber-500" size={24} />
                    <div>
                        <div className="text-2xl font-black">{streak?.longestStreak || 0}</div>
                        <div className="text-[10px] uppercase tracking-widest text-gray-500">Best Streak</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-6 py-3 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <Target className="text-green-500" size={24} />
                    <div>
                        <div className="text-2xl font-black">
                            {streak?.totalPlayed ? Math.round((streak.totalCorrect / streak.totalPlayed) * 100) : 0}%
                        </div>
                        <div className="text-[10px] uppercase tracking-widest text-gray-500">Accuracy</div>
                    </div>
                </div>
            </div>

            {/* Main Puzzle Card */}
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-8 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900">
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest">
                            <Sparkles size={14} />
                            Today's Puzzle
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${categoryColors[puzzle.category] || 'bg-gray-100 text-gray-700'}`}>
                            {puzzle.category.replace('_', ' ')}
                        </span>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${difficultyColors[puzzle.difficulty]}`}></div>
                            <span className="text-xs font-bold text-gray-500">{puzzle.difficulty}</span>
                        </div>
                        {!isComplete && (
                            <div className="ml-auto flex items-center gap-2 text-gray-500">
                                <Clock size={16} />
                                <span className="font-mono font-bold">{formatTime(timeElapsed)}</span>
                            </div>
                        )}
                    </div>

                    {puzzle.context && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 italic">
                            {puzzle.context}
                        </p>
                    )}

                    <h2 className="text-2xl md:text-3xl font-black leading-tight text-gray-900 dark:text-white">
                        {puzzle.question}
                    </h2>
                </div>

                {/* Options */}
                <div className="p-8 space-y-4">
                    {options.map((option) => {
                        const isSelected = selectedAnswer === option.key
                        const isCorrect = result?.correctAnswer === option.key || (hasAttempted && previousAttempt?.isCorrect && previousAttempt.answer === option.key)
                        const isWrong = (result && !result.isCorrect && isSelected) || (hasAttempted && previousAttempt && !previousAttempt.isCorrect && previousAttempt.answer === option.key)
                        const showAsCorrect = isComplete && (result?.correctAnswer === option.key || (hasAttempted && isSelected && previousAttempt?.isCorrect))

                        return (
                            <button
                                key={option.key}
                                onClick={() => !isComplete && setSelectedAnswer(option.key)}
                                disabled={isComplete || isSubmitting || !isLoggedIn}
                                className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 flex items-start gap-4 group ${showAsCorrect
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                    : isWrong
                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                        : isSelected
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    } ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0 transition-all ${showAsCorrect
                                    ? 'bg-green-500 text-white'
                                    : isWrong
                                        ? 'bg-red-500 text-white'
                                        : isSelected
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600'
                                    }`}>
                                    {showAsCorrect ? <CheckCircle size={20} /> : isWrong ? <XCircle size={20} /> : option.key}
                                </span>
                                <span className="font-medium text-gray-900 dark:text-white leading-relaxed pt-2">{option.text}</span>
                            </button>
                        )
                    })}
                </div>

                {/* Submit Button or Result */}
                <div className="p-8 pt-0">
                    {!isLoggedIn && (
                        <div className="text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl mb-4">
                            <p className="text-gray-500 mb-4">Sign in to play and track your streak!</p>
                            <a href="/login" className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition">
                                Sign In <ChevronRight size={18} />
                            </a>
                        </div>
                    )}

                    {isLoggedIn && !isComplete && (
                        <button
                            onClick={handleSubmit}
                            disabled={!selectedAnswer || isSubmitting}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-5 rounded-2xl font-black text-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Checking...
                                </>
                            ) : (
                                <>
                                    <Zap size={20} />
                                    Lock In Answer
                                </>
                            )}
                        </button>
                    )}

                    {isComplete && (result || previousAttempt) && (
                        <div className={`p-6 rounded-2xl ${(result?.isCorrect ?? previousAttempt?.isCorrect)
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                            }`}>
                            <div className="flex items-center gap-3 mb-4">
                                {(result?.isCorrect ?? previousAttempt?.isCorrect) ? (
                                    <>
                                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                            <CheckCircle className="text-white" size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-green-700 dark:text-green-400">Perfect!</h3>
                                            <p className="text-green-600/80 text-sm">Your product sense is on fire 🔥</p>
                                        </div>
                                        {result && (
                                            <div className="ml-auto flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full">
                                                <Flame size={18} />
                                                <span className="font-black">{result.newStreak} Day Streak!</span>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                                            <XCircle className="text-white" size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-red-700 dark:text-red-400">Not Quite!</h3>
                                            <p className="text-red-600/80 text-sm">Keep building that product intuition</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Explanation */}
                {showExplanation && result && (
                    <div className="px-8 pb-8">
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                            <h4 className="font-black text-sm uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                                <Sparkles size={14} className="text-amber-500" />
                                The Insight
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                {result.explanation}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Come Back Tomorrow */}
            {isComplete && (
                <div className="text-center py-8">
                    <p className="text-gray-500 mb-2">New puzzle drops at</p>
                    <p className="text-2xl font-black text-blue-600">12:00 AM IST</p>
                    <p className="text-sm text-gray-400 mt-2">Keep your streak alive! 🔥</p>
                </div>
            )}
        </div>
    )
}
