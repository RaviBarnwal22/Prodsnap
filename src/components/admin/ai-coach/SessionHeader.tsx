import { Flame, Target, CalendarDays, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface SessionHeaderProps {
    streak: number;
    masteryScore: number;
    lastSessionDate: string | null;
}

export function SessionHeader({ streak, masteryScore, lastSessionDate }: SessionHeaderProps) {
    const today = new Date().toISOString().split('T')[0];
    const isToday = lastSessionDate === today;

    return (
        <header className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-800">
            <div className="flex items-center gap-6">
                <Link 
                    href="/admin" 
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    title="Back to Admin Dashboard"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        AI Coach <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">Admin</span>
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-xl border border-gray-700/50" title="Current Learning Streak">
                    <Flame size={18} className={streak > 0 ? "text-orange-500" : "text-gray-500"} />
                    <span className="font-medium text-sm text-gray-200">{streak} Day{streak !== 1 ? 's' : ''}</span>
                </div>
                
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-xl border border-gray-700/50" title="Overall Mastery Score">
                    <Target size={18} className="text-green-500" />
                    <span className="font-medium text-sm text-gray-200">{masteryScore}% Mastery</span>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-xl border border-gray-700/50" title="Last Session Date">
                    <CalendarDays size={18} className="text-blue-500" />
                    <span className="font-medium text-sm text-gray-200">
                        {isToday ? 'Today' : (lastSessionDate || 'Never')}
                    </span>
                </div>
            </div>
        </header>
    )
}
