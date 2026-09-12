import { Brain, AlertCircle, TrendingUp, CheckCircle2, BookOpen, X, Calendar } from 'lucide-react'
import { RevisionCard } from '@/lib/ai-coach/types'

interface SidePanelProps {
    currentTopic: string;
    weakConcepts: string[];
    interviewReadiness: number;
    revisionDeck: RevisionCard[];
    onRemoveCard: (id: string) => void;
}

export function SidePanel({ currentTopic, weakConcepts, interviewReadiness, revisionDeck, onRemoveCard }: SidePanelProps) {
    return (
        <div className="w-80 border-l border-gray-800 bg-gray-900/50 p-6 flex flex-col gap-6 overflow-y-auto">

            {/* Focus Topic */}
            <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                    <Brain size={14} />
                    Current Focus
                </h3>
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <p className="font-bold text-blue-400">{currentTopic}</p>
                </div>
            </div>

            {/* Interview Readiness */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                        <TrendingUp size={14} />
                        Interview Readiness
                    </h3>
                    <span className="text-sm font-bold text-gray-300">{interviewReadiness}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${interviewReadiness}%` }}
                    ></div>
                </div>
            </div>

            {/* Revision Deck */}
            <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                    <BookOpen size={14} />
                    Revision Deck
                    {revisionDeck.length > 0 && (
                        <span className="ml-auto bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded-full border border-indigo-500/30">
                            {revisionDeck.length}
                        </span>
                    )}
                </h3>

                {revisionDeck.length > 0 ? (
                    <ul className="space-y-3">
                        {[...revisionDeck].reverse().map(card => (
                            <li key={card.id} className="relative p-3 bg-indigo-900/20 border border-indigo-500/20 rounded-xl group">
                                <button
                                    onClick={() => onRemoveCard(card.id)}
                                    className="absolute top-2 right-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Remove from deck"
                                >
                                    <X size={14} />
                                </button>
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <span className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-1.5 py-0.5 rounded">
                                        {card.topicTag}
                                    </span>
                                    <span className="text-xs text-gray-500 flex items-center gap-1 ml-auto">
                                        <Calendar size={10} />
                                        {card.date}
                                    </span>
                                </div>
                                <p className="text-xs font-bold text-white mb-1 pr-4 leading-snug">{card.concept}</p>
                                <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">{card.context}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center justify-center p-5 bg-gray-800/20 rounded-xl border border-gray-800 border-dashed text-center">
                        <BookOpen size={20} className="text-indigo-500/40 mb-2" />
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Say <span className="text-indigo-400 font-semibold">"add it to revision deck"</span> in chat to save key concepts here.
                        </p>
                    </div>
                )}
            </div>

            {/* Weak Concepts to Review */}
            <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                    <AlertCircle size={14} />
                    Needs Review
                </h3>
                {weakConcepts.length > 0 ? (
                    <ul className="space-y-2">
                        {weakConcepts.map((concept, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-300 p-2.5 bg-gray-800/50 rounded-lg border border-gray-700/50">
                                <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></div>
                                {concept}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center justify-center p-6 bg-gray-800/30 rounded-xl border border-gray-800 border-dashed text-center">
                        <CheckCircle2 size={24} className="text-green-500/50 mb-2" />
                        <p className="text-sm text-gray-400">No weak areas identified currently.</p>
                    </div>
                )}
            </div>

        </div>
    )
}
