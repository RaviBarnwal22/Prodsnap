'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { submitAnswer, submitPracticeFeedback } from '@/app/actions'
import { useForm } from 'react-hook-form'
import { Mic, MicOff, CheckCircle2, AlertTriangle, Lightbulb, Info, ExternalLink, ShieldCheck, Trophy, Sparkles, Calculator, BarChart3, Activity, Users, MessageSquare, ArrowRight, Loader2, Clock, Lock } from 'lucide-react'
import { AIEvaluationResponse } from '@/lib/ai/engine'
import { PracticeFeedbackModal } from './PracticeFeedbackModal'
import { MentorSuggestionModal } from './MentorSuggestionModal'
import { ErrorModal } from './ErrorModal'

interface AnswerFormProps {
    questionId: string
    questionTitle: string
    userId?: string
    category: string
    description: string
    solutionText?: string
    sampleAnswer?: string
    elapsedTime?: number
    onSubmitted?: () => void
    onRetry?: () => void
    previousSubmission?: {
        answerText: string
        aiScore?: string
        createdAt: string
    }
    isPremium?: boolean
    initialResult?: AIEvaluationResponse
}

export function AnswerForm({
    questionId,
    questionTitle,
    userId,
    category,
    description,
    solutionText,
    sampleAnswer,
    elapsedTime = 0,
    onSubmitted,
    onRetry,
    previousSubmission,
    isPremium = false,
    initialResult
}: AnswerFormProps) {
    // Initialize result with prop if provided
    const [result, setResult] = useState<AIEvaluationResponse | null>(initialResult || null)
    const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null)
    const scrollHandlerRef = useRef<(() => void) | null>(null)

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isRecording, setIsRecording] = useState(false)
    const [showFeedbackModal, setShowFeedbackModal] = useState(false)
    const [showMentorSuggestion, setShowMentorSuggestion] = useState(false)
    const [submissionCount, setSubmissionCount] = useState(0)
    const [submissionId, setSubmissionId] = useState<string | null>(null)
    const [showErrorModal, setShowErrorModal] = useState(false)
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
    const [previousAnswer, setPreviousAnswer] = useState(previousSubmission?.answerText || '')
    const [npsScore, setNpsScore] = useState<number | null>(null)
    const [additionalFeedback, setAdditionalFeedback] = useState('')
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

    // Clarification Chat State
    const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model', text: string }[]>([])
    const [chatInput, setChatInput] = useState('')
    const [isAsking, setIsAsking] = useState(false)
    const [chatOpen, setChatOpen] = useState(true)
    const [chatError, setChatError] = useState('')
    const [hintCount, setHintCount] = useState(0)
    const chatMessagesRef = useRef<HTMLDivElement>(null)

    // Auto-scroll chat messages to bottom
    useEffect(() => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
        }
    }, [chatMessages])

    const loadingMessages = [
        "Analyzing your product framework...",
        "Evaluating strategic depth...",
        "Identifying key strengths...",
        "Generating improvement suggestions...",
        "Aligning with expert standards...",
        "Almost ready with your feedback..."
    ]

    // Cycle through loading messages
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (isSubmitting) {
            interval = setInterval(() => {
                setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length)
            }, 3000)
        }
        return () => clearInterval(interval)
    }, [isSubmitting])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null)
    const answerRef = useRef("")
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<{ answer: string }>()
    const answerValue = watch("answer") || ""

    // Auto-save and Restore logic
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const draftKey = `draft_${questionId}`

            // 1. Initial restoration
            const saved = localStorage.getItem(draftKey) || localStorage.getItem('pending_answer')
            if (saved) {
                try {
                    const parsed = JSON.parse(saved)
                    if ((parsed.qId === questionId || parsed.questionId === questionId) && parsed.answer && !answerValue) {
                        setValue("answer", parsed.answer, { shouldValidate: true })
                    }
                } catch (e) { console.error("Error restoring answer", e) }
            }
        }
    }, [questionId]) // Run once on mount/id change

    // 2. Continuous saving and Ref sync
    useEffect(() => {
        answerRef.current = answerValue
        if (typeof window !== 'undefined' && answerValue) {
            const draftKey = `draft_${questionId}`
            const currentDraft = {
                qId: questionId,
                answer: answerValue,
                elapsedTime: elapsedTime,
                updatedAt: new Date().toISOString()
            }
            localStorage.setItem(draftKey, JSON.stringify(currentDraft))
        }
    }, [answerValue, elapsedTime, questionId])

    // Handle Speech Recognition setup
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition()
                recognition.continuous = true
                recognition.interimResults = true

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                recognition.onresult = (event: any) => {
                    let finalTranscript = ""
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript
                        }
                    }
                    if (finalTranscript) {
                        const currentText = answerRef.current
                        const separator = currentText && !currentText.endsWith(" ") ? " " : ""
                        setValue("answer", currentText + separator + finalTranscript.trim(), { shouldValidate: true })
                    }
                }

                recognition.onend = () => setIsRecording(false)
                recognition.onerror = () => setIsRecording(false)
                recognitionRef.current = recognition
            }
        }
        return () => recognitionRef.current?.stop()
    }, [setValue])

    // Handle pending answer from guest redirect
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const pending = localStorage.getItem('pending_answer')
                if (pending) {
                    const parsed = JSON.parse(pending)
                    if (parsed.qId === questionId) {
                        setValue('answer', parsed.answer, { shouldValidate: true })
                        localStorage.removeItem('pending_answer')
                    }
                }
            } catch (err) {
                console.error("Error restoring pending answer:", err)
            }
        }
    }, [questionId, setValue])

    // Cleanup timers and listeners on unmount
    useEffect(() => {
        return () => {
            if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
            if (scrollHandlerRef.current) window.removeEventListener('scroll', scrollHandlerRef.current)
        }
    }, [])

    const handleGetHint = async () => {
        const hintLimit = isPremium ? 999 : 3
        if (hintCount >= hintLimit || isAsking) return
        setIsAsking(true)
        setChatError('')
        try {
            const { getInterviewerHint } = await import('@/app/actions')
            const resp = await getInterviewerHint({
                questionTitle,
                questionDescription: description,
                history: chatMessages
            })

            if (resp.success && resp.text) {
                const cleanText = resp.text.replace(/^(\s*💡?\s*HINT\s*:?\s*)+/i, '').trim();
                setChatMessages([...chatMessages, { role: 'model', text: `💡 HINT: ${cleanText}` }])
                setHintCount(prev => prev + 1)
                setChatOpen(true)
            } else {
                setChatError(resp.error || "Failed to get hint")
            }
        } catch (err) {
            setChatError("Something went wrong.")
        } finally {
            setIsAsking(false)
        }
    }

    const handleAskClarification = async (e?: React.FormEvent, customMsg?: string) => {
        if (e) e.preventDefault()
        const userMsg = customMsg || chatInput.trim()
        const clarifyingQuestionCount = chatMessages.filter(m => m.role === 'user').length

        // Dynamic limits: Guest: 5, Logged-in: 10, Premium: Unlimited
        const limit = !userId ? 5 : isPremium ? 999 : 10
        const isOverLimit = clarifyingQuestionCount >= limit

        if (!userMsg || isAsking || Boolean(isOverLimit)) return

        setChatInput('')
        setIsAsking(true)
        setChatError('')
        const newMessages = [...chatMessages, { role: 'user' as const, text: userMsg }]
        setChatMessages(newMessages)

        try {
            const { askClarifyingQuestion } = await import('@/app/actions')
            const history = newMessages.slice(0, -1).map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }))

            const resp = await askClarifyingQuestion({
                questionTitle,
                questionDescription: description,
                userMessage: userMsg,
                history
            })

            if (resp.success && resp.text) {
                setChatMessages([...newMessages, { role: 'model', text: resp.text }])
            } else {
                setChatError(resp.error || "Failed to get response")
            }
        } catch (err) {
            setChatError("Something went wrong. Please try again.")
        } finally {
            setIsAsking(false)
        }
    }

    const killFeedbackTriggers = () => {
        if (feedbackTimerRef.current) {
            clearTimeout(feedbackTimerRef.current)
            feedbackTimerRef.current = null
        }
        if (scrollHandlerRef.current) {
            window.removeEventListener('scroll', scrollHandlerRef.current)
            scrollHandlerRef.current = null
        }
        setShowFeedbackModal(false)
    }

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop()
            setIsRecording(false)
        } else {
            if (!recognitionRef.current) {
                alert("Speech recognition is not supported in this browser.")
                return
            }
            try {
                recognitionRef.current.start()
                setIsRecording(true)
            } catch (err) {
                console.error("Failed to start recognition", err)
            }
        }
    }

    const onSubmit = async (data: { answer: string }) => {
        setError(null)

        // Validate answer is not empty or just template
        const trimmedAnswer = data.answer.trim()
        if (!trimmedAnswer || trimmedAnswer.length < 50) {
            setError("Please write a more detailed answer (at least 50 characters).")
            return
        }

        // Check if answer is just the framework template without real content
        const templatePatterns = ['**CIRCLES Framework**', '**STAR Framework**', '**HEART Framework**', '**GAME Framework**']
        const isOnlyTemplate = templatePatterns.some(t =>
            trimmedAnswer.startsWith(t) && trimmedAnswer.replace(/[\s\n\-:*]/g, '').length < 100
        )
        if (isOnlyTemplate) {
            setError("Please fill in the framework with your actual answer.")
            return
        }

        if (!userId) {
            if (typeof window !== 'undefined') {
                localStorage.setItem('pending_answer', JSON.stringify({ qId: questionId, answer: data.answer }))
                window.location.href = `/login?redirectedFrom=/practice/${questionId}`
            }
            return
        }
        setIsSubmitting(true)
        if (onSubmitted) onSubmitted()
        try {
            const chatContext = chatMessages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n')
            const response = await submitAnswer(questionId, data.answer, elapsedTime, chatContext)
            if (response.success && response.aiResponse) {
                // SUCCESS: Clear local storage draft
                if (typeof window !== 'undefined') {
                    localStorage.removeItem(`draft_${questionId}`)
                    localStorage.removeItem('pending_answer')
                }

                setPreviousAnswer(data.answer)
                setResult(response.aiResponse)
                setSubmissionId(response.submissionId || null)

                // Auto-scroll to top of result
                window.scrollTo({ top: 0, behavior: 'smooth' })

                // Feedback Modal Logic: 30s delay + Scroll to bottom
                // Clear any existing timer/listener first just in case
                if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
                if (scrollHandlerRef.current) window.removeEventListener('scroll', scrollHandlerRef.current)

                feedbackTimerRef.current = setTimeout(() => {
                    const handleScrollCheck = () => {
                        // Check if user is near the bottom of the page (within 300px)
                        const isAtBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 300)

                        if (isAtBottom) {
                            setShowFeedbackModal(true)
                            if (scrollHandlerRef.current) {
                                window.removeEventListener('scroll', scrollHandlerRef.current)
                                scrollHandlerRef.current = null
                            }
                        }
                    }
                    scrollHandlerRef.current = handleScrollCheck
                    // Attach listener after 30 seconds
                    window.addEventListener('scroll', handleScrollCheck)
                    // Also check immediately in case they already scrolled down
                    handleScrollCheck()

                    // Safety Fallback: If they stay on page for another 30s (total 60s), just show it
                    setTimeout(() => {
                        if (scrollHandlerRef.current) {
                            setShowFeedbackModal(true)
                            window.removeEventListener('scroll', scrollHandlerRef.current)
                            scrollHandlerRef.current = null
                        }
                    }, 30000)
                }, 30000)

                // Submission count for mentor suggestion
                try {
                    const countResponse = await fetch('/api/submission-count')
                    if (countResponse.ok) {
                        const countData = await countResponse.json()
                        setSubmissionCount(countData.count)
                        if (countData.shouldShowMentorSuggestion) {
                            const lastDismissed = localStorage.getItem('mentorReminderDismissed')
                            if (!lastDismissed || (Date.now() - parseInt(lastDismissed)) > 7 * 24 * 60 * 60 * 1000) {
                                setTimeout(() => setShowMentorSuggestion(true), 5000)
                            }
                        }
                    }
                } catch (err) { console.error(err) }
            } else {
                setError(response.error || "Submission failed")
                setShowErrorModal(true)
            }
        } catch (e) {
            setError("An unexpected error occurred.")
            setShowErrorModal(true)
        } finally {
            setIsSubmitting(false)
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    if (result) {
        return (
            <div className="space-y-6">
                {previousSubmission && (
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-4 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-blue-500/20">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                                <Trophy size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest opacity-80">Previous Performance</p>
                                <p className="text-sm font-bold">You scored {result.scores.overall}/5 on {new Date(previousSubmission.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                killFeedbackTriggers()
                                setResult(null)
                                if (onRetry) onRetry()
                            }}
                            className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-black transition-all border border-white/20 flex items-center gap-2"
                        >
                            Try Again
                            <ArrowRight size={16} />
                        </button>
                    </div>
                )}

                <div className="bg-white dark:bg-gray-900 border rounded-2xl p-8 space-y-8 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                AI Evaluation
                            </h3>
                            <p className="text-sm text-gray-500 font-medium">Powered by Gemini AI Engine</p>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            {elapsedTime > 0 && (
                                <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 px-4 py-2 rounded-xl flex items-center gap-2">
                                    <Clock size={16} className="text-violet-600 dark:text-violet-400" />
                                    <span className="text-sm font-bold text-violet-800 dark:text-violet-200">
                                        Time: {formatTime(elapsedTime)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* User's Answer */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Info size={20} className="text-gray-400" />
                            Your Answer
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {previousAnswer || previousSubmission?.answerText}
                        </p>
                    </div>

                    {/* Section Scores */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(result.scores).map(([key, score]) => {
                            if (key === 'overall') return null;
                            const analysis = (result.detailed_analysis as Record<string, string>)[key];
                            return (
                                <div key={key} className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[10px] uppercase text-gray-500 font-black tracking-widest">{key.replace('_', ' ')}</span>
                                        <span className="text-sm font-black text-gray-900 dark:text-gray-100">{score as number}/5</span>
                                    </div>
                                    {analysis && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic">
                                            &quot;{analysis}&quot;
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Summary */}
                    <div className="bg-gradient-to-r from-violet-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-black text-sm uppercase tracking-wider">Summary Feedback</h4>
                            <div className="bg-white/20 px-4 py-1 rounded-full text-sm font-black">Score: {result.scores.overall}/5</div>
                        </div>
                        <p className="text-violet-50 leading-relaxed font-medium">{result.feedback}</p>
                    </div>

                    {/* Gold Standard Solution */}
                    {result.improved_example && (
                        <div className="border-2 border-amber-100 dark:border-amber-900/30 rounded-[2rem] overflow-hidden">
                            <div className="bg-amber-50 dark:bg-amber-900/20 px-8 py-6 border-b border-amber-100 dark:border-amber-900/30 flex items-center gap-3">
                                <div className="bg-amber-500 text-white p-2 rounded-xl">
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <h4 className="font-black text-lg text-amber-900 dark:text-amber-100">Gold Standard Solution</h4>
                                    <p className="text-xs text-amber-700 dark:text-amber-400 font-bold uppercase tracking-widest">The Expert Approach</p>
                                </div>
                            </div>
                            <div className="p-8 bg-white dark:bg-gray-900">
                                <div className="prose dark:prose-invert max-w-none">
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap font-medium">
                                        {result.improved_example}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Detailed Experience Feedback */}
                    <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-3xl p-8 space-y-8">
                        {feedbackSubmitted ? (
                            <div className="text-center py-4 space-y-2">
                                <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 size={24} />
                                </div>
                                <h4 className="text-lg font-black text-gray-900 dark:text-white">Feedback Received!</h4>
                                <p className="text-sm text-gray-500 font-medium">Thank you for helping us improve our AI evaluations.</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-6">
                                    <div className="text-center md:text-left">
                                        <h4 className="text-lg font-black text-gray-900 dark:text-white">Rate your experience</h4>
                                        <p className="text-sm text-gray-500 font-medium mt-1">How likely is it that you would recommend Prodsnap to a friend?</p>
                                    </div>

                                    {/* NPS Score Buttons 0-10 */}
                                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                        {[...Array(11)].map((_, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setNpsScore(i)}
                                                className={`w-10 h-10 rounded-xl text-sm font-black transition-all flex items-center justify-center border-2 ${npsScore === i
                                                    ? 'bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-600/20 scale-110'
                                                    : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-400 hover:border-violet-200 hover:text-violet-600'
                                                    }`}
                                            >
                                                {i}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                                        <span>Not Likely</span>
                                        <span>Extremely Likely</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-black text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <MessageSquare size={16} className="text-violet-600" />
                                        Any additional feedback for the AI or the platform?
                                    </label>
                                    <textarea
                                        value={additionalFeedback}
                                        onChange={(e) => setAdditionalFeedback(e.target.value)}
                                        placeholder="What did the AI get right? What could be improved?"
                                        className="w-full bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all outline-none min-h-[100px]"
                                    />
                                </div>

                                <button
                                    type="button"
                                    disabled={npsScore === null || isSubmittingFeedback}
                                    onClick={async () => {
                                        if (npsScore === null) return
                                        setIsSubmittingFeedback(true)
                                        const res = await submitPracticeFeedback({
                                            npsScore,
                                            comments: additionalFeedback,
                                            experience: npsScore >= 8 ? 'Good' : npsScore >= 5 ? 'Average' : 'Poor',
                                            submissionId: submissionId || undefined
                                        })
                                        setIsSubmittingFeedback(false)
                                        if (res.success) {
                                            setFeedbackSubmitted(true)
                                        }
                                    }}
                                    className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-gray-200 dark:disabled:bg-gray-800 text-white py-4 rounded-xl font-black transition-all shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2"
                                >
                                    {isSubmittingFeedback ? (
                                        <Loader2 className="animate-spin" size={18} />
                                    ) : (
                                        'Submit Feedback'
                                    )}
                                </button>
                            </>
                        )}
                    </div>

                    <button
                        onClick={() => {
                            killFeedbackTriggers()
                            setResult(null)
                            setPreviousAnswer('')
                            setValue('answer', '')
                            if (onRetry) onRetry()
                        }}
                        className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white py-4 rounded-xl font-bold transition-all"
                    >
                        Clear & Retry
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="relative">
            <AnimatePresence>
                {isSubmitting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
                    >
                        <Loader2 className="animate-spin text-violet-600 mb-4" size={48} />
                        <h3 className="text-xl font-black text-gray-900 dark:text-white">Evaluating Solution</h3>
                        <p className="text-violet-600 font-bold mt-2">{loadingMessages[loadingMessageIndex]}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Templates */}
                <div className="space-y-2">
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5">
                        <Lightbulb size={12} className="text-amber-500" />
                        Use these frameworks to structure your response
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setValue('answer', `**CIRCLES Framework**

C - Comprehend the Situation:


I - Identify the Users:


R - Report User Needs:


C - Cut Through Prioritization:


L - List Solutions:


E - Evaluate Trade-offs:


S - Summarize Your Recommendation:
`)}
                            className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-violet-600 hover:text-white transition-all border border-gray-200 dark:border-gray-700"
                        >
                            CIRCLES Framework
                        </button>
                        <button
                            type="button"
                            onClick={() => setValue('answer', `**STAR Framework**

S - Situation (Context & Background):


T - Task (Your Role & Objective):


A - Action (Steps You Took):


R - Result (Outcome & Impact):
`)}
                            className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-violet-600 hover:text-white transition-all border border-gray-200 dark:border-gray-700"
                        >
                            STAR Framework
                        </button>
                        <button
                            type="button"
                            onClick={() => setValue('answer', `**HEART Framework**

H - Happiness (User Satisfaction):


E - Engagement (User Activity Level):


A - Adoption (New User Acquisition):


R - Retention (User Loyalty):


T - Task Success (Goal Completion Rate):
`)}
                            className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-violet-600 hover:text-white transition-all border border-gray-200 dark:border-gray-700"
                        >
                            HEART Framework
                        </button>
                        <button
                            type="button"
                            onClick={() => setValue('answer', `**GAME Framework**

G - Goals (Define Success Metrics):


A - Actions (Key User Behaviors):


M - Metrics (Measurable Indicators):


E - Evaluate (Analyze & Iterate):
`)}
                            className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-violet-600 hover:text-white transition-all border border-gray-200 dark:border-gray-700"
                        >
                            GAME Framework
                        </button>
                    </div>
                </div>

                {/* Clarification Hub */}
                <div className="bg-white dark:bg-gray-900 border rounded-2xl overflow-hidden shadow-sm border-violet-100 dark:border-violet-900/30">
                    <div
                        onClick={() => setChatOpen(!chatOpen)}
                        className="p-4 bg-violet-50/50 dark:bg-violet-950/10 flex items-center justify-between cursor-pointer border-b border-violet-100 dark:border-violet-900/30"
                    >
                        <div className="flex items-center gap-3">
                            <MessageSquare className="text-violet-600" size={18} />
                            <h4 className="text-xs font-black uppercase text-violet-900 dark:text-violet-100">Interviewer Hub</h4>
                        </div>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); if (userId) handleGetHint(); else window.location.href = '/login'; }}
                            disabled={userId ? (hintCount >= (isPremium ? 999 : 3) || isAsking) : false}
                            className="bg-violet-600 text-white px-3 py-1 rounded-lg text-[10px] font-black disabled:opacity-30 flex items-center gap-1"
                        >
                            {!userId && <Lock size={10} />}
                            {isPremium ? "Get Hint" : (hintCount === 0 ? "Get Hint" : `${3 - hintCount} Hints Left`)}
                        </button>
                    </div>
                    {chatOpen && (
                        <div className="p-4 space-y-4 relative min-h-[160px]">
                            <div ref={chatMessagesRef} className="max-h-[200px] overflow-y-auto space-y-3 scroll-smooth">
                                {chatMessages.length === 0 && (
                                    <div className="text-[11px] text-gray-400 italic text-center py-4">
                                        No clarifications yet. Focus on identifying the core problem.
                                    </div>
                                )}
                                {chatMessages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`p-3 rounded-2xl text-xs font-medium max-w-[85%] ${msg.role === 'user' ? 'bg-violet-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Question limit warning */}
                            {((!userId && chatMessages.filter(m => m.role === 'user').length >= 5) || (userId && !isPremium && chatMessages.filter(m => m.role === 'user').length >= 10)) && (
                                <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 p-3 rounded-xl text-center">
                                    <p className="text-xs font-bold text-violet-700 dark:text-violet-300 mb-2">
                                        {!userId ? "You've used all 5 guest questions!" : "You've used all 10 free questions!"}
                                    </p>
                                    {!isPremium && (
                                        <button
                                            onClick={() => {
                                                if (!userId) window.location.href = '/login'
                                                else {
                                                    // This is handled by common upgrade triggers
                                                    alert("Upgrade to Premium for unlimited interviewer access!");
                                                }
                                            }}
                                            className="text-[10px] font-black uppercase bg-violet-600 text-white px-4 py-1.5 rounded-lg hover:shadow-lg transition-all"
                                        >
                                            {!userId ? "Sign In for 10 More" : "Upgrade for Unlimited"}
                                        </button>
                                    )}
                                </div>
                            )}
                            {/* Questions remaining indicator */}
                            {!isPremium && chatMessages.filter(m => m.role === 'user').length > 0 && chatMessages.filter(m => m.role === 'user').length < (!userId ? 5 : 10) && (
                                <p className="text-[10px] text-gray-400 text-center">
                                    {(!userId ? 5 : 10) - chatMessages.filter(m => m.role === 'user').length} questions remaining
                                </p>
                            )}
                            {isPremium && (
                                <p className="text-[10px] text-violet-400 text-center font-bold">
                                    Premium Access: Unlimited Questions
                                </p>
                            )}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey && chatInput.trim()) {
                                            e.preventDefault()
                                            handleAskClarification()
                                        }
                                    }}
                                    disabled={Boolean((!userId && chatMessages.filter(m => m.role === 'user').length >= 5) || (userId && !isPremium && chatMessages.filter(m => m.role === 'user').length >= 10))}
                                    placeholder={(!userId && chatMessages.filter(m => m.role === 'user').length >= 5) || (userId && !isPremium && chatMessages.filter(m => m.role === 'user').length >= 10) ? "Limit reached..." : "Ask the interviewer a question..."}
                                    className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl text-xs outline-none disabled:opacity-50"
                                />
                                <button type="button" onClick={handleAskClarification} disabled={Boolean(!chatInput.trim() || isAsking || (!userId && chatMessages.filter(m => m.role === 'user').length >= 5) || (userId && !isPremium && chatMessages.filter(m => m.role === 'user').length >= 10))} className="p-2 bg-violet-600 text-white rounded-xl disabled:opacity-50"><ArrowRight size={18} /></button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Input */}
                <div className="relative">
                    <textarea
                        {...register("answer", {
                            required: "Please enter your answer",
                            minLength: { value: 50, message: "Answer must be at least 50 characters" }
                        })}
                        className={`w-full h-80 p-6 border rounded-[1.5rem] focus:ring-4 focus:ring-violet-500/10 focus:border-violet-600 outline-none dark:bg-gray-800 dark:border-gray-700 transition-all font-medium leading-relaxed ${errors.answer ? 'border-red-500' : ''}`}
                        placeholder="Type your structured product response here..."
                    />
                    {errors.answer && (
                        <p className="absolute -bottom-6 left-6 text-xs text-red-500 font-medium">
                            {errors.answer.message}
                        </p>
                    )}
                    <button
                        type="button"
                        onClick={toggleRecording}
                        className={`absolute bottom-6 right-6 p-4 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200'}`}
                    >
                        {isRecording ? <Mic size={24} /> : <MicOff size={24} />}
                    </button>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100 dark:border-blue-900/30">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-sm text-blue-600">
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-gray-900 dark:text-white mb-0.5">
                                {userId ? "Ready for Evaluation?" : "Unlock AI Feedback"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-sm">
                                {userId
                                    ? "Submit your solution to get a detailed mapping against Google's PM criteria."
                                    : "Join Prodsnap to get instant AI-guided feedback and track your progress across different tracks."}
                            </p>
                        </div>
                    </div>
                    {userId ? (
                        <button
                            type="submit"
                            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-500/20 whitespace-nowrap active:scale-95 flex items-center justify-center gap-2"
                        >
                            Submit Solution
                            <ArrowRight size={20} />
                        </button>
                    ) : (
                        <Link
                            href={`/login?redirectedFrom=/practice/${questionId}`}
                            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-500/20 whitespace-nowrap active:scale-95 flex items-center justify-center gap-2"
                        >
                            Sign In to Submit
                            <ArrowRight size={20} />
                        </Link>
                    )}
                </div>
            </form>

            {/* Modals */}
            <PracticeFeedbackModal
                isOpen={showFeedbackModal}
                onClose={() => setShowFeedbackModal(false)}
                onSubmit={async (data) => {
                    await submitPracticeFeedback({ ...data, submissionId: submissionId || undefined })
                }}
            />
            <MentorSuggestionModal
                isOpen={showMentorSuggestion}
                onClose={() => setShowMentorSuggestion(false)}
                completedSessions={submissionCount}
            />
            <ErrorModal
                isOpen={showErrorModal}
                onClose={() => setShowErrorModal(false)}
                errorMessage={error || undefined}
            />
        </div>
    )
}
