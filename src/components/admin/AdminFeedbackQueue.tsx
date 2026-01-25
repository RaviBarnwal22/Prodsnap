'use client'

import { useState } from 'react'
import { Star, MessageSquare } from 'lucide-react'

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
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }).format(new Date(date))
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
                {feedbacks.map((item) => (
                    <div
                        key={item.id}
                        className="p-4 rounded-xl border border-gray-700/50 bg-gray-900/40 hover:bg-gray-900/60 transition-colors"
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
                            <p className="text-sm text-gray-300 italic">"{item.feedback}"</p>
                        ) : (
                            <p className="text-sm text-gray-600 italic">No written feedback provided.</p>
                        )}
                    </div>
                ))}

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
