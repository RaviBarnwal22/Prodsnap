import { Target, Clock, RefreshCw, Briefcase } from 'lucide-react'

interface MissionCardProps {
    objective: string;
    timeEstimate: string;
    topic: string;
    onAction: (actionType: 'learn' | 'interview') => void;
}

export function MissionCard({ objective, timeEstimate, topic, onAction }: MissionCardProps) {
    return (
        <div className="bg-gradient-to-br from-indigo-900/40 to-blue-900/20 border border-indigo-500/30 rounded-2xl p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                        <Target size={20} className="text-indigo-400" />
                        Today's Mission
                    </h2>
                    <p className="text-indigo-200 text-sm">Focus Topic: <span className="font-semibold text-white">{topic}</span></p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-lg text-xs font-medium text-gray-300 border border-white/5">
                    <Clock size={14} />
                    ~{timeEstimate}
                </div>
            </div>
            
            <p className="text-gray-200 font-medium text-lg leading-relaxed mb-6">
                "{objective}"
            </p>

            <div className="flex gap-3">
                <button 
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                    onClick={() => onAction('learn')}
                >
                    <Target size={16} />
                    Start Learning
                </button>
                <button 
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2.5 px-4 rounded-xl border border-gray-700 transition-colors flex items-center justify-center gap-2 text-sm"
                    title="Mock Interview Mode"
                    onClick={() => onAction('interview')}
                >
                    <Briefcase size={16} className="text-blue-400" />
                    Interview Mode
                </button>
            </div>
        </div>
    )
}
