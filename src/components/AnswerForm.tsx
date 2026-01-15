'use client'

import { useState, useRef, useEffect } from 'react'
import { submitAnswer, submitPracticeFeedback } from '@/app/actions'
import { useForm } from 'react-hook-form'
import { Mic, MicOff, CheckCircle2, AlertTriangle, Lightbulb, Info, ExternalLink, ShieldCheck, Trophy } from 'lucide-react'
import { AIEvaluationResponse } from '@/lib/ai/engine'
import { PracticeFeedbackModal } from './PracticeFeedbackModal'
import { MentorSuggestionModal } from './MentorSuggestionModal'
import { ErrorModal } from './ErrorModal'

interface AnswerFormProps {
    questionId: string
    userId?: string
    solutionText?: string
    sampleAnswer?: string
    elapsedTime?: number
    previousSubmission?: {
        answerText: string
        aiScore?: string
        createdAt: string
    }
}

export function AnswerForm({ questionId, userId, solutionText, sampleAnswer, elapsedTime = 0, previousSubmission }: AnswerFormProps) {
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
    const [previousAnswer, setPreviousAnswer] = useState(previousSubmission?.answerText || '')
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
        try {
            const response = await submitAnswer(questionId, data.answer, elapsedTime)
            console.log("Submission response:", response)
            if (response.success && response.aiResponse) {
                setPreviousAnswer(data.answer) // Save the answer for display
                setResult(response.aiResponse)
                setSubmissionId(response.submissionId || null)

                // Show feedback modal after 2 seconds
                setTimeout(() => {
                    setShowFeedbackModal(true)
                }, 2000)

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
                    <p className="text-violet-50 leading-relaxed font-medium text-base">
                        {result.feedback}
                    </p>
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
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
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
                    }}
                    className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-4 rounded-xl font-bold transition-all shadow-xl flex items-center justify-center gap-2"
                >
                    Clear & Retry
                </button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
    )
}
