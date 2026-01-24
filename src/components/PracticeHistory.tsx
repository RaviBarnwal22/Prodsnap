'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { History, ChevronRight, Star, Clock, FileText } from 'lucide-react'

interface PracticeHistoryProps {
    history: {
        id: string
        answerText: string
        aiScore?: string
        createdAt: string
    }[]
}

export function PracticeHistory({ history }: PracticeHistoryProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null)

    if (history.length === 0) return null

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="p-4 bg-gray-50/50 dark:bg-gray-950/50 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-gray-500">
                    <History size={14} />
                    Practice History
                </div>
                <span className="bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {history.length} Tries
                </span>
            </div>

            <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {history.map((item, index) => {
                    let score = 0
                    try {
                        const parsed = JSON.parse(item.aiScore || '{}')
                        score = parsed.scores?.overall || 0
                    } catch (e) { }

                    const isSelected = selectedId === item.id

                    return (
                        <div key={item.id} className="group transition-colors">
                            <button
                                onClick={() => setSelectedId(isSelected ? null : item.id)}
                                className="w-full p-4 flex items-center justify-between hover:bg-violet-50/30 dark:hover:bg-violet-900/5 transition-all"
                            >
                                <div className="flex items-center gap-4 text-left">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${score >= 4 ? 'bg-green-100 text-green-600' :
                                            score >= 3 ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                        {score}/5
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">Attempt #{history.length - index}</p>
                                        <div className="flex items-center gap-3 text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-medium">
                                            <span className="flex items-center gap-1"><Clock size={10} /> {new Date(item.createdAt).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1"><Star size={10} /> {score >= 4 ? 'Strong' : 'Improving'}</span>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight
                                    size={16}
                                    className={`text-gray-300 transition-transform ${isSelected ? 'rotate-90' : 'group-hover:translate-x-1'}`}
                                />
                            </button>

                            <AnimatePresence>
                                {isSelected && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden bg-gray-50/50 dark:bg-gray-950/50"
                                    >
                                        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-violet-500 mb-3">
                                                <FileText size={12} />
                                                Your Response
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed max-h-40 overflow-y-auto pr-2 custom-scrollbar whitespace-pre-wrap">
                                                {item.answerText}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
