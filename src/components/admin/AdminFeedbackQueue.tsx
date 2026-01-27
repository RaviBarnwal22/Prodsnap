'use client'

import { useState } from 'react'
import { Star, MessageSquare, Send, Loader2, Mail } from 'lucide-react'
import { sendManualUserReply } from '@/app/actions'

interface FeedbackItem {
    id: string
    type: 'MENTORSHIP' | 'APP_PRACTICE'
    userName: string
    userEmail: string
    rating: number // 1-5 for reviews, 0-10 for NPS
    feedback: string | null
    createdAt: Date
    serviceType?: string // for mentorship
}

interface AdminFeedbackQueueProps {
    feedbacks: FeedbackItem[]
}

export function AdminFeedbackQueue({ feedbacks }: AdminFeedbackQueueProps) {
    const [replyingTo, setReplyingTo] = useState<string | null>(null)
    const [replyMessage, setReplyMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [sentIds, setSentIds] = useState<string[]>([])

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }).format(new Date(date))
    }

    const handleReply = async (item: FeedbackItem) => {
        if (!replyMessage.trim()) return
        setIsSubmitting(true)

        try {
            const res = await sendManualUserReply({
                email: item.userEmail,
                name: item.userName,
                subject: `Re: Your ${item.type === 'MENTORSHIP' ? 'Mentorship' : 'Practice'} Feedback on Prodsnap`,
                message: replyMessage,
                originalFeedback: item.feedback || undefined
            })

            if (res.success) {
                setSentIds([...sentIds, item.id])
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
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl overflow-hidden h-full">
            <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-white">
                <div className="p-2 bg-pink-500/20 rounded-lg">
                    <Star className="text-pink-400" size={20} />
                </div>
                User Feedback & Reviews
                <span className="ml-auto bg-gray-700 px-3 py-1 rounded-full text-xs font-bold text-gray-400">
                    {feedbacks.length} Total
                </span>
            </h2>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {feedbacks.map((item) => {
                    const isReplying = replyingTo === item.id
                    const isSent = sentIds.includes(item.id)

                    return (
                        <div
                            key={item.id}
                            className={`p-4 rounded-xl border transition-all duration-200 ${isSent ? 'border-green-500/30 bg-green-500/5' : 'border-gray-700/50 bg-gray-900/40 hover:bg-gray-900/60'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="text-sm font-black text-white">{item.userName}</p>
                                    <p className="text-xs text-gray-400">{item.userEmail}</p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className={`
                                        px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1
                                        ${item.type === 'MENTORSHIP' ? 'bg-purple-500/20 text-purple-400' : 'bg-cyan-500/20 text-cyan-400'}
                                    `}>
                                        {item.type === 'MENTORSHIP' ? 'Mentorship' : 'App Review'}
                                    </span>
                                    <span className="text-[10px] text-gray-500">{formatDate(item.createdAt)}</span>
                                </div>
                            </div>

                            <div className="mb-2">
                                {item.type === 'MENTORSHIP' ? (
                                    <div className="flex items-center gap-1 text-yellow-400 mb-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                size={12}
                                                fill={star <= item.rating ? "currentColor" : "none"}
                                                className={star <= item.rating ? "" : "text-gray-700"}
                                            />
                                        ))}
                                        <span className="text-xs ml-1 font-bold text-gray-300">
                                            ({item.serviceType})
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`
                                            text-xs font-bold px-2 py-0.5 rounded
                                            ${item.rating >= 9 ? 'bg-green-500/20 text-green-400' :
                                                item.rating >= 7 ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-red-500/20 text-red-400'}
                                        `}>
                                            NPS: {item.rating}/10
                                        </span>
                                    </div>
                                )}
                            </div>

                            {item.feedback ? (
                                <p className="text-sm text-gray-300 italic mb-3">"{item.feedback}"</p>
                            ) : (
                                <p className="text-sm text-gray-600 italic mb-3">No written feedback provided.</p>
                            )}

                            {/* Reply Action */}
                            <div className="mt-3 pt-3 border-t border-gray-800">
                                {isSent ? (
                                    <p className="text-[10px] text-green-400 font-bold flex items-center gap-1">
                                        <Send size={10} /> Email Reply Sent
                                    </p>
                                ) : isReplying ? (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-1">
                                        <textarea
                                            className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 text-xs text-white focus:ring-1 focus:ring-blue-500 focus:outline-none placeholder:text-gray-600"
                                            placeholder={`Reply to ${item.userName}...`}
                                            rows={3}
                                            value={replyMessage}
                                            onChange={(e) => setReplyMessage(e.target.value)}
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleReply(item)}
                                                disabled={isSubmitting || !replyMessage.trim()}
                                                className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black rounded-lg transition-all flex items-center justify-center gap-2"
                                            >
                                                {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                                                Send From support@prodsnap.in
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setReplyingTo(null)
                                                    setReplyMessage('')
                                                }}
                                                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-[10px] font-black rounded-lg transition-all"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setReplyingTo(item.id)}
                                        className="text-[10px] font-black text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                                    >
                                        <Mail size={12} /> Reply via Email
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}

                {feedbacks.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageSquare className="text-gray-500" size={24} />
                        </div>
                        <p className="text-gray-500 font-bold">No feedback received yet.</p>
                    </div>
                )}
            </div>
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #374151;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #4b5563;
                }
            `}</style>
        </div>
    )
}
