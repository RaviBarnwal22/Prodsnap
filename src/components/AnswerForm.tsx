'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { submitAnswer, submitPracticeFeedback } from '@/app/actions'
import { useForm } from 'react-hook-form'
import { Mic, MicOff, CheckCircle2, AlertTriangle, Lightbulb, Info, ExternalLink, ShieldCheck, Trophy, Sparkles, Calculator, BarChart3, Activity, Users, MessageSquare, ArrowRight } from 'lucide-react'
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
}

export function AnswerForm({ questionId, questionTitle, userId, category, description, solutionText, sampleAnswer, elapsedTime = 0, onSubmitted, onRetry, previousSubmission, isPremium = false }: AnswerFormProps) {
    // Initialize result with previous submission if it exists
    const [result, setResult] = useState<AIEvaluationResponse | null>(() => {
        if (previousSubmission?.aiScore) {
            try {
                return JSON.parse(previousSubmission.aiScore)
            } catch {
                return null
            }
        }
        return null
    })

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

    // Clarification Chat State
    const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model', text: string }[]>([])
    const [chatInput, setChatInput] = useState('')
    const [isAsking, setIsAsking] = useState(false)
    const [chatOpen, setChatOpen] = useState(false)
    const [chatError, setChatError] = useState('')
    const [hintCount, setHintCount] = useState(0)

    const handleGetHint = async () => {
        if (hintCount >= 3 || isAsking) return

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
                // Strip existing "HINT" prefixes if AI tried to mimic the history
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
        const limit = isPremium ? 50 : 10 // Use 50 as a high practical limit for premium, or true infinity

        if (!userMsg || isAsking || clarifyingQuestionCount >= limit) return

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

    // Keep answerRef in sync with form state
    useEffect(() => {
        answerRef.current = answerValue
    }, [answerValue])

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

                recognition.onend = () => {
                    setIsRecording(false)
                }

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                recognition.onerror = (event: any) => {
                    console.error("Speech Recognition Error", event.error)
                    setIsRecording(false)
                }

                recognitionRef.current = recognition
            }
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop()
            }
        }
    }, [setValue])

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
        console.log("Submitting answer data:", data)
        if (!userId) {
            setError("Please login to submit")
            return
        }
        setIsSubmitting(true)
        if (onSubmitted) {
            onSubmitted()
        }
        try {
            // Include chat context in submission for AI evaluation
            const chatContext = chatMessages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n')
            const response = await submitAnswer(questionId, data.answer, elapsedTime, chatContext)
            console.log("Submission response:", response)
            if (response.success && response.aiResponse) {
                setPreviousAnswer(data.answer) // Save the answer for display
                setResult(response.aiResponse)
                setSubmissionId(response.submissionId || null)


                // Wait 30 seconds, then check for scroll depth
                setTimeout(() => {
                    const handleScrollCheck = () => {
                        const scrollPosition = window.innerHeight + window.scrollY;
                        const pageHeight = document.documentElement.scrollHeight;

                        // If user is within 100px of the bottom (or end of content)
                        if (scrollPosition >= pageHeight - 500) {
                            setShowFeedbackModal(true);
                            window.removeEventListener('scroll', handleScrollCheck);
                        }
                    };

                    // Check immediately in case they are already at bottom
                    handleScrollCheck();

                    // If not shown yet, listen for scroll
                    window.addEventListener('scroll', handleScrollCheck);
                }, 30000);

                // Fetch submission count to check if we should show mentor suggestion
                try {
                    const countResponse = await fetch('/api/submission-count')
                    if (countResponse.ok) {
                        const countData = await countResponse.json()
                        setSubmissionCount(countData.count)

                        // Check if user should see mentor suggestion
                        // Show only if: 1) count is 5 or more, 2) hasn't dismissed recently
                        if (countData.shouldShowMentorSuggestion) {
                            const lastDismissed = localStorage.getItem('mentorReminderDismissed')
                            const shouldShow = !lastDismissed ||
                                (Date.now() - parseInt(lastDismissed)) > 7 * 24 * 60 * 60 * 1000 // 7 days

                            if (shouldShow) {
                                // Show mentor suggestion modal after feedback modal
                                setTimeout(() => {
                                    setShowMentorSuggestion(true)
                                }, 5000) // Show 5 seconds after feedback modal
                            }
                        }
                    }
                } catch (err) {
                    console.error('Failed to fetch submission count:', err)
                }
            } else {
                setError(response.error || "Submission failed")
                setShowErrorModal(true)
            }
        } catch (e) {
            console.error("Submission catch error:", e)
            setError("An unexpected error occurred. Please try again.")
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
                            <p className="text-[10px] text-gray-400 mt-1 italic italic flex items-center gap-1">
                                <Info size={10} />
                                AI-generated feedback can be incorrect. Use as a guide, not absolute truth.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            {elapsedTime > 0 && (
                                <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 px-4 py-2 rounded-xl flex items-center gap-2">
                                    <Info size={16} className="text-violet-600 dark:text-violet-400" />
                                    <span className="text-sm font-bold text-violet-800 dark:text-violet-200">
                                        Time: {formatTime(elapsedTime)}
                                    </span>
                                </div>
                            )}
                            {result.isMock && (
                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 p-3 rounded-xl flex items-start gap-3 max-w-sm">
                                    <Info size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                    <div className="text-[11px] text-amber-800 dark:text-amber-300">
                                        <span className="font-bold block mb-1">PRO-TIP: Reality Check Needed</span>
                                        This is a <strong>mock response</strong>. To enable real-time AI evaluation, add your <code>GEMINI_API_KEY</code> to the <code>.env</code> file.
                                        <a href="https://aistudio.google.com/app/apikey" target="_blank" className="font-bold underline ml-1 inline-flex items-center gap-0.5">
                                            Get key <ExternalLink size={10} />
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* User's Answer */}
                    {(previousAnswer || previousSubmission) && (
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <Info size={20} className="text-gray-600 dark:text-gray-400" />
                                Your Answer
                            </h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {previousAnswer || previousSubmission?.answerText}
                            </p>
                            {previousSubmission?.createdAt && (
                                <p className="text-xs text-gray-500 mt-3">
                                    Submitted: {new Date(previousSubmission.createdAt).toLocaleString()}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Section Scores */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(result.scores).map(([key, score]) => {
                            if (key === 'overall') return null;
                            const analysis = (result.detailed_analysis as Record<string, string>)[key];
                            return (
                                <div key={key} className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[10px] uppercase text-gray-500 font-black tracking-widest">{key.replace('_', ' ')}</span>
                                        <div className="flex items-center gap-1">
                                            <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${Number(score) >= 4 ? 'bg-green-500' : Number(score) >= 3 ? 'bg-blue-500' : 'bg-amber-500'}`}
                                                    style={{ width: `${(Number(score) / 5) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-black text-gray-900 dark:text-gray-100 min-w-[32px] text-right">{score as number}/5</span>
                                        </div>
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

                    {/* Overall Summary */}
                    <div className="bg-gradient-to-r from-violet-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg shadow-violet-500/20">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-black flex items-center gap-2 text-sm uppercase tracking-wider">
                                Summary Feedback
                            </h4>
                            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-black">
                                Score: {result.scores.overall}/5
                            </div>
                        </div>
                        <p className="text-violet-50 leading-relaxed font-medium text-base whitespace-pre-wrap">
                            {result.feedback}
                        </p>
                        <div className="mt-8 pt-4 border-t border-white/20 flex flex-col items-center">
                            <p className="text-sm font-medium mb-3 opacity-90">How helpful was this AI feedback?</p>
                            <button
                                onClick={() => setShowFeedbackModal(true)}
                                className="bg-white text-violet-700 hover:bg-violet-50 px-6 py-2 rounded-full font-bold transition-all shadow-md flex items-center gap-2 group"
                            >
                                <Sparkles size={16} className="text-violet-500 group-hover:text-violet-600" />
                                Rate Feedback
                            </button>
                        </div>
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-green-50 dark:bg-green-900/10 p-6 rounded-2xl border border-green-100 dark:border-green-900/30">
                            <h4 className="font-bold text-green-800 dark:text-green-300 mb-4 flex items-center gap-2">
                                <CheckCircle2 size={20} />
                                Key Strengths
                            </h4>
                            <ul className="space-y-3">
                                {(result.strengths || []).map((s: string, i: number) => (
                                    <li key={i} className="text-sm text-green-700 dark:text-green-400 flex items-start gap-2">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                            <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-4 flex items-center gap-2">
                                <AlertTriangle size={20} />
                                Areas for Growth
                            </h4>
                            <ul className="space-y-3">
                                {(result.weaknesses || []).map((s: string, i: number) => (
                                    <li key={i} className="text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Improved Example */}
                    {result.improved_example && (
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <Lightbulb size={20} className="text-blue-500" />
                                AI Suggestion: A 5/5 Path
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                                {result.improved_example}
                            </p>
                        </div>
                    )}

                    {/* Expert Guide (Ground Truth) */}
                    {solutionText && (
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                            <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                                <ShieldCheck size={20} className="text-blue-600" />
                                Expert Structured Guide
                            </h4>
                            <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                                {solutionText}
                            </p>
                        </div>
                    )}

                    {/* Sample Answer (Ground Truth) */}
                    {sampleAnswer && (
                        <div className="bg-purple-50 dark:bg-purple-900/10 p-6 rounded-2xl border border-purple-100 dark:border-purple-900/30">
                            <h4 className="font-bold text-purple-900 dark:text-purple-300 mb-3 flex items-center gap-2">
                                <Trophy size={20} className="text-purple-600" />
                                Curated 5/5 Sample Answer
                            </h4>
                            <p className="text-sm text-purple-800 dark:text-purple-200 leading-relaxed font-serif italic">
                                &quot;{sampleAnswer}&quot;
                            </p>
                        </div>
                    )}

                    <button
                        onClick={() => {
                            setResult(null)
                            setPreviousAnswer('')
                            setValue('answer', '')
                            if (onRetry) onRetry()
                        }}
                        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-4 rounded-xl font-bold transition-all shadow-xl flex items-center justify-center gap-2"
                    >
                        Clear & Retry
                    </button>
                </div>

                {/* Modals for Result View */}
                <PracticeFeedbackModal
                    isOpen={showFeedbackModal}
                    onClose={() => setShowFeedbackModal(false)}
                    onSubmit={async (data) => {
                        await submitPracticeFeedback({
                            ...data,
                            submissionId: submissionId || undefined
                        })
                    }}
                />

                <MentorSuggestionModal
                    isOpen={showMentorSuggestion}
                    onClose={() => setShowMentorSuggestion(false)}
                    completedSessions={submissionCount}
                />

                <ErrorModal
                    isOpen={showErrorModal}
                    onClose={() => {
                        setShowErrorModal(false)
                        setError(null)
                    }}
                    errorMessage={error || undefined}
                />
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
                        <div className="relative w-20 h-20 mb-8">
                            <motion.div
                                className="absolute inset-0 border-4 border-violet-100 dark:border-violet-900/30 rounded-full"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                            <motion.div
                                className="absolute inset-0 border-4 border-violet-600 rounded-full border-t-transparent"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles className="text-violet-600 animate-pulse" size={32} />
                            </div>
                        </div>

                        <motion.div
                            key={loadingMessageIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-2"
                        >
                            <h3 className="text-xl font-black text-gray-900 dark:text-white">
                                Evaluating Case Solution
                            </h3>
                            <p className="text-violet-600 dark:text-violet-400 font-bold bg-violet-50 dark:bg-violet-900/20 px-4 py-1 rounded-full text-sm inline-block">
                                {loadingMessages[loadingMessageIndex]}
                            </p>
                        </motion.div>

                        <p className="mt-8 text-xs text-gray-400 font-medium uppercase tracking-[0.2em]">
                            This usually takes 10-15 seconds
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 w-full mb-1">Answer Template:</span>
                    {(() => {
                        const getTemplates = (cat: string) => {
                            switch (cat) {
                                case 'CONSUMER_PRODUCT_DESIGN':
                                    return [
                                        { name: 'CIRCLES Framework', icon: <Sparkles size={12} />, template: "Clarify Goal:\n- \n\nIdentity Users:\n- \n\nReport Needs:\n- \n\nCut Prioritization:\n- \n\nList Solutions:\n- \n\nEvaluate Trade-offs:\n- \n\nSummarize:\n- " },
                                        { name: 'HEART Framework', icon: <Info size={12} />, template: "Happiness:\n- \n\nEngagement:\n- \n\nAdoption:\n- \n\nRetention:\n- \n\nTask Success:\n- " }
                                    ]
                                case 'GUESTIMATES':
                                    return [
                                        { name: 'Top-Down Approach', icon: <Calculator size={12} />, template: "Total Population:\n- \n\nRelevant Segment %:\n- \n\nFrequency of Use:\n- \n\nReplacement Cycle:\n- \n\nFinal Estimate:\n- " },
                                        { name: 'Bottom-Up Approach', icon: <Calculator size={12} />, template: "Supply Side Units:\n- \n\nOperating Hours:\n- \n\nUtilization Rate %:\n- \n\nTransactions per Hour:\n- \n\nFinal Estimate:\n- " }
                                    ]
                                case 'METRICS':
                                    return [
                                        { name: 'GAME Framework', icon: <BarChart3 size={12} />, template: "Goals:\n- \n\nActions:\n- \n\nMetrics:\n- \n\nEvaluations:\n- " },
                                        { name: 'North Star Metric', icon: <Sparkles size={12} />, template: "North Star:\n- \n\nInput Metric 1:\n- \n\nInput Metric 2:\n- \n\nInput Metric 3:\n- " }
                                    ]
                                case 'RCA':
                                    return [
                                        { name: '5 Whys Method', icon: <Info size={12} />, template: "Problem Statement:\n- \n\nWhy 1:\n- \n\nWhy 2:\n- \n\nWhy 3:\n- \n\nWhy 4:\n- \n\nWhy 5:\n- \n\nRoot Cause:\n- " },
                                        { name: 'Fishbone Diagram', icon: <Activity size={12} />, template: "People:\n- \n\nProcess:\n- \n\nPlatform:\n- \n\nExternal:\n- " }
                                    ]
                                case 'BEHAVIORAL':
                                    return [
                                        { name: 'STAR Method', icon: <Users size={12} />, template: "Situation:\n- \n\nTask:\n- \n\nAction:\n- \n\nResult:\n- " }
                                    ]
                                default:
                                    return [
                                        { name: 'CIRCLES Framework', icon: <Sparkles size={12} />, template: "Goal:\n- \n\nUsers:\n- \n\nPain Points:\n- \n\nSolutions:\n- \n\nPrioritization:\n- \n\nTrade-offs:\n- " },
                                        { name: '5W1H Framework', icon: <Info size={12} />, template: "Who:\n- \n\nWhat:\n- \n\nWhere:\n- \n\nWhen:\n- \n\nWhy:\n- \n\nHow:\n- " }
                                    ]
                            }
                        }

                        return getTemplates(category).map((t, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setValue('answer', t.template)}
                                className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-violet-600 hover:text-white transition-all flex items-center gap-1.5 border border-gray-200 dark:border-gray-700"
                            >
                                {t.icon}
                                {t.name}
                            </button>
                        ))
                    })()}
                </div>

                {/* Clarification Hub - Powered by Perplexity AI */}
                {!result && (
                    <div className="bg-white dark:bg-gray-900 border rounded-2xl overflow-hidden shadow-sm transition-all border-violet-100 dark:border-violet-900/30 mb-8">
                        {/* Hub Header */}
                        <div
                            onClick={() => setChatOpen(!chatOpen)}
                            className="p-4 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20 flex items-center justify-between cursor-pointer hover:opacity-90 transition-all border-b border-violet-100 dark:border-violet-900/30"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
                                    <MessageSquare size={16} />
                                </div>
                                <div className="text-left">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-violet-900 dark:text-violet-100">
                                        Interviewer Hub (Clarifying Questions)
                                    </h4>
                                    <p className="text-[10px] text-violet-600 dark:text-violet-400 font-bold">
                                        {isPremium
                                            ? "Unlimited clarifying questions active"
                                            : `Trial: ${chatMessages.filter(m => m.role === 'user').length}/10 clarifying questions used`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleGetHint(); }}
                                    disabled={hintCount >= 3 || isAsking}
                                    className="px-3 py-1.5 rounded-lg bg-violet-600 text-white text-[10px] font-black hover:bg-violet-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
                                >
                                    <Lightbulb size={12} />
                                    {hintCount === 0 ? "Get Hint" : `${3 - hintCount} Hints Left`}
                                </button>
                                <motion.div animate={{ rotate: chatOpen ? 180 : 0 }}>
                                    <ArrowRight size={16} className="text-violet-400 rotate-90" />
                                </motion.div>
                            </div>
                        </div>

                        <AnimatePresence>
                            {chatOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-4 space-y-4">
                                        {/* Chat Messages */}
                                        <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-violet-100">
                                            {chatMessages.length === 0 ? (
                                                <div className="text-center py-6 text-gray-400">
                                                    <Info size={24} className="mx-auto mb-2 opacity-20" />
                                                    <p className="text-xs font-medium">No questions asked yet. Clarify the case goal, ask about user segments, or get context from the interviewer.</p>
                                                </div>
                                            ) : (
                                                chatMessages.map((msg, i) => (
                                                    <div
                                                        key={i}
                                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                                    >
                                                        <div className={`max-w-[85%] p-3 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${msg.role === 'user'
                                                            ? 'bg-violet-600 text-white rounded-tr-none'
                                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-tl-none border border-gray-200 dark:border-gray-700'
                                                            }`}>
                                                            {msg.text}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                            {isAsking && (
                                                <div className="flex justify-start">
                                                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                                                        <div className="flex gap-1">
                                                            <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                            <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                            <div className="w-1.5 h-1.5 bg-violet-600 rounded-full animate-bounce"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {chatError && (
                                                <div className="text-[10px] text-red-500 font-bold text-center bg-red-50 dark:bg-red-900/10 py-2 rounded-lg border border-red-100 dark:border-red-900/30">
                                                    {chatError}
                                                </div>
                                            )}
                                        </div>


                                        {/* Chat Input */}
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAskClarification(e)}
                                                placeholder={!isPremium && chatMessages.filter(m => m.role === 'user').length >= 10
                                                    ? "Clarification limit reached"
                                                    : "Ask a clarifying question..."}
                                                disabled={!isPremium && chatMessages.filter(m => m.role === 'user').length >= 10}
                                                className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl text-xs focus:ring-4 focus:ring-violet-500/10 focus:border-violet-600 transition-all outline-none disabled:bg-gray-200 dark:disabled:bg-gray-900 disabled:cursor-not-allowed"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAskClarification}
                                                disabled={isAsking || !chatInput.trim()}
                                                className="w-10 h-10 bg-violet-600 text-white rounded-xl flex items-center justify-center hover:bg-violet-700 transition shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ArrowRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
                <div className="relative">
                    <textarea
                        {...register("answer", { required: true })}
                        className="w-full h-64 p-4 pr-12 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none dark:bg-gray-800 dark:border-gray-700"
                        placeholder="Type or speak your answer here..."
                    />
                    <button
                        type="button"
                        onClick={toggleRecording}
                        className={`absolute bottom-4 right-4 p-3 rounded-full transition ${isRecording
                            ? 'bg-red-100 text-red-600 animate-pulse dark:bg-red-900/30'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                        title={isRecording ? "Stop Recording" : "Start Voice Input"}
                    >
                        {isRecording ? <Mic className="text-red-600" size={20} /> : <MicOff size={20} />}
                    </button>
                </div>

                {errors.answer && (
                    <p className="text-red-500 text-sm">Please provide an answer before submitting.</p>
                )}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-violet-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                    >
                        {isSubmitting ? 'Analyzing...' : 'Submit Choice'}
                    </button>
                </div>

                {/* Mentor Suggestion Modal */}
                <MentorSuggestionModal
                    isOpen={showMentorSuggestion}
                    onClose={() => setShowMentorSuggestion(false)}
                    completedSessions={submissionCount}
                />

                {/* Error Modal */}
                <ErrorModal
                    isOpen={showErrorModal}
                    onClose={() => {
                        setShowErrorModal(false)
                        setError(null)
                    }}
                    errorMessage={error || undefined}
                />
            </form>
        </div>
    )
}
