import { Brain, AlertCircle, TrendingUp, CheckCircle2 } from 'lucide-react'

interface SidePanelProps {
    currentTopic: string;
    weakConcepts: string[];
    interviewReadiness: number;
}

export function SidePanel({ currentTopic, weakConcepts, interviewReadiness }: SidePanelProps) {
    return (
        <div className="w-80 border-l border-gray-800 bg-gray-900/50 p-6 flex flex-col gap-8 overflow-y-auto">
            
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
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full" 
                        style={{ width: `${interviewReadiness}%` }}
                    ></div>
                </div>
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
