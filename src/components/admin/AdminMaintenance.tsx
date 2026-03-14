'use client'

import { useState } from 'react'
import { Zap, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react'

export function AdminMaintenance() {
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    return (
        <div className="space-y-8">
            <div className="bg-gray-800 rounded-3xl p-8 border border-gray-700 shadow-xl">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                        <Zap size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white">System Maintenance</h2>
                        <p className="text-gray-400 font-medium">Manually trigger data synchronization and AI scraping.</p>
                    </div>
                </div>

                {message && (
                    <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 border ${message.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                        }`}>
                        {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        <p className="font-bold text-sm">{message.text}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    <p className="text-gray-400 text-sm italic">No maintenance tasks currently available for the enabled features.</p>
                </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl">
                <div className="flex items-center gap-3 text-amber-500 mb-2 font-black uppercase tracking-widest text-xs">
                    <Sparkles size={16} fill="currentColor" />
                    Pro Tip
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                    One refresh per day is usually sufficient as the system also runs on an automated cron schedule at 5:30 AM IST.
                </p>
            </div>
        </div>
    )
}
