'use client'

import { useState } from 'react'
import { MessageSquare, Send, CheckCircle2, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { replyToSupport } from '@/app/actions'

interface ContactSubmission {
    id: string
    name: string
    email: string
    message: string
    reply: string | null
    repliedAt: Date | null
    createdAt: Date
}

interface AdminSupportQueueProps {
    submissions: ContactSubmission[]
}

export function AdminSupportQueue({ submissions }: AdminSupportQueueProps) {
    const [replyingTo, setReplyingTo] = useState<string | null>(null)
    const [replyMessage, setReplyMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [expandedIds, setExpandedIds] = useState<string[]>([])

    const toggleExpand = (id: string) => {
        setExpandedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const handleReply = async (id: string) => {
        if (!replyMessage.trim()) return

        setIsSubmitting(true)
        try {
            const res = await replyToSupport({
                submissionId: id,
                replyMessage: replyMessage
            })

            if (res.success) {
                setReplyingTo(null)
                setReplyMessage('')
                // The page will revalidate due to revalidatePath('/admin')
            } else {
                alert(res.error || 'Failed to send reply')
            }
        } catch (err) {
            console.error('Reply error:', err)
            alert('An unexpected error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date))
    }

    return (
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl overflow-hidden">
            <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-white">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                    <MessageSquare className="text-orange-400" size={20} />
                </div>
                Support Queue
                <span className="ml-auto bg-gray-700 px-3 py-1 rounded-full text-xs font-bold text-gray-400">
                    {submissions.filter(s => !s.repliedAt).length} Pending
                </span>
            </h2>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {submissions.map((c) => {
                    const isExpanded = expandedIds.includes(c.id)
                    const isReplying = replyingTo === c.id
                    const isReplied = !!c.repliedAt

                    return (
                        <div
                            key={c.id}
                            className={`p-4 rounded-xl border transition-all duration-200 ${isReplied
                                    ? 'bg-gray-900/50 border-gray-700/50 opacity-80'
                                    : 'bg-orange-500/5 border-orange-500/20 hover:border-orange-500/40 shadow-sm'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="text-sm font-black text-white flex items-center gap-2">
                                        {c.name}
                                        {isReplied && (
                                            <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <CheckCircle2 size={10} /> Replied
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-400 font-medium">{c.email}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                        {formatDate(c.createdAt)}
                                    </p>
                                    <button
                                        onClick={() => toggleExpand(c.id)}
                                        className="text-gray-500 hover:text-white mt-1"
                                    >
                                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className={`text-sm text-gray-300 leading-relaxed ${!isExpanded && !isReplying ? 'line-clamp-2' : ''}`}>
                                &quot;{c.message}&quot;
                            </div>

                            {(isExpanded || isReplying || isReplied) && (
                                <div className="mt-4 pt-4 border-t border-gray-700/50 space-y-4">
                                    {isReplied && (
                                        <div className="bg-green-500/5 p-3 rounded-lg border border-green-500/20">
                                            <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                                <Clock size={10} /> Replied on {formatDate(c.repliedAt!)}
                                            </p>
                                            <p className="text-sm text-green-100/80 italic">
                                                &quot;{c.reply}&quot;
                                            </p>
                                        </div>
                                    )}

                                    {!isReplied && !isReplying && (
                                        <button
                                            onClick={() => setReplyingTo(c.id)}
                                            className="w-full py-2 bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-white text-xs font-black rounded-lg transition-all border border-orange-500/30 flex items-center justify-center gap-2"
                                        >
                                            <Send size={14} /> Reply to Customer
                                        </button>
                                    )}

                                    {isReplying && (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                            <textarea
                                                className="w-full bg-gray-900 border border-orange-500/30 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-orange-500 focus:outline-none placeholder:text-gray-600"
                                                placeholder="Type your response here..."
                                                rows={4}
                                                value={replyMessage}
                                                onChange={(e) => setReplyMessage(e.target.value)}
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleReply(c.id)}
                                                    disabled={isSubmitting || !replyMessage.trim()}
                                                    className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                                                >
                                                    {isSubmitting ? 'Sending...' : 'Send Email Reply'}
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
                            )}
                        </div>
                    )
                })}

                {submissions.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageSquare className="text-gray-500" size={24} />
                        </div>
                        <p className="text-gray-500 font-bold">No support requests yet.</p>
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
