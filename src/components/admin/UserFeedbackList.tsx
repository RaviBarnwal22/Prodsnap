'use client'

import { useState } from 'react'
import { MessageSquare, Star, User, Calendar, Search, Send, Loader2, Mail } from 'lucide-react'
import { sendManualUserReply } from '@/app/actions'

interface PracticeFeedback {
    id: string
    experience: string
    comments: string | null
    npsScore: number
    createdAt: Date | string
    user: {
        id: string
        name: string | null
        email: string
    }
    submission: {
        question: {
            title: string
        }
    } | null
}

export function UserFeedbackList({ feedbacks }: { feedbacks: PracticeFeedback[] }) {
    const [searchQuery, setSearchQuery] = useState('')

    const [replyingTo, setReplyingTo] = useState<string | null>(null)
    const [replyMessage, setReplyMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [sentIds, setSentIds] = useState<string[]>([])

    const filteredFeedbacks = feedbacks.filter(f =>
        f.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.user.name && f.user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (f.comments && f.comments.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    const getNpsColor = (score: number) => {
        if (score >= 9) return 'text-green-500 bg-green-500/10 border-green-500/20'
        if (score >= 7) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
        return 'text-red-500 bg-red-500/10 border-red-500/20'
    }

    const handleReply = async (feedback: PracticeFeedback) => {
        if (!replyMessage.trim()) return
        setIsSubmitting(true)

        try {
            const res = await sendManualUserReply({
                email: feedback.user.email,
                name: feedback.user.name || 'User',
                subject: `Re: Your Practice Feedback on Prodsnap`,
                message: replyMessage,
                originalFeedback: feedback.comments || undefined
            })

            if (res.success) {
                setSentIds([...sentIds, feedback.id])
                setReplyingTo(null)
                setReplyMessage('')
            } else {
                alert(res.error || 'Failed to send email')
            }
        } catch (err) {
            alert('An error occurred while sending the email')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <MessageSquare size={20} className="text-blue-400" />
                    AI Feedback Ratings
                    <span className="text-sm font-normal text-gray-500">({filteredFeedbacks.length})</span>
                </h3>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    <input
                        type="text"
                        placeholder="Search feedback..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="grid gap-4">
                {filteredFeedbacks.map((feedback) => {
                    const isReplying = replyingTo === feedback.id
                    const isSent = sentIds.includes(feedback.id)

                    return (
                        <div
                            key={feedback.id}
                            className={`bg-gray-800/50 border border-gray-700 rounded-xl p-6 transition-all ${isSent ? 'border-green-500/30 bg-green-500/5' : 'hover:bg-gray-800'}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">
                                            {feedback.user.name || feedback.user.email}
                                        </h4>
                                        <p className="text-xs text-gray-400">{feedback.user.email}</p>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full border text-xs font-black ${getNpsColor(feedback.npsScore)}`}>
                                    NPS: {feedback.npsScore}/10
                                </div>
                            </div>

                            {feedback.submission && (
                                <div className="mb-4 text-xs">
                                    <span className="text-gray-500">Case: </span>
                                    <span className="text-gray-300 font-medium">{feedback.submission.question.title}</span>
                                </div>
                            )}

                            <div className="mb-4">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Rating</div>
                                <div className="text-white font-medium">{feedback.experience}</div>
                            </div>

                            {feedback.comments && (
                                <div className="mb-4">
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Feedback</div>
                                    <div className="bg-gray-900/50 p-3 rounded-lg text-sm text-gray-300 italic border border-gray-800">
                                        "{feedback.comments}"
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700/50">
                                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                                    <Calendar size={12} />
                                    {new Date(feedback.createdAt).toLocaleString()}
                                </div>

                                {isSent ? (
                                    <p className="text-[10px] text-green-400 font-bold flex items-center gap-1">
                                        <Send size={10} /> Reply Sent
                                    </p>
                                ) : (
                                    <button
                                        onClick={() => setReplyingTo(feedback.id)}
                                        className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors"
                                    >
                                        <Mail size={14} />
                                        Reply via Email
                                    </button>
                                )}
                            </div>

                            {isReplying && (
                                <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-1">
                                    <textarea
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-blue-500 focus:outline-none placeholder:text-gray-600"
                                        placeholder={`Send a response to ${feedback.user.name || 'user'}...`}
                                        rows={4}
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleReply(feedback)}
                                            disabled={isSubmitting || !replyMessage.trim()}
                                            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                                        >
                                            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                            Send Response from support@prodsnap.in
                                        </button>
                                        <button
                                            onClick={() => {
                                                setReplyingTo(null)
                                                setReplyMessage('')
                                            }}
                                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs font-black rounded-lg transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}

                {filteredFeedbacks.length === 0 && (
                    <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-dashed border-gray-700">
                        <p className="text-gray-500">No feedback found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
