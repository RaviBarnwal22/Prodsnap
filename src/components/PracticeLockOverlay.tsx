'use client'

import { useState } from 'react'
import { Lock } from 'lucide-react'
import { PremiumUpgradeModal } from './PremiumUpgradeModal'

interface PracticeLockOverlayProps {
    category: string
    userEmail?: string
    userName?: string
}

export function PracticeLockOverlay({ category, userEmail, userName }: PracticeLockOverlayProps) {
    const [showModal, setShowModal] = useState(false)

    return (
        <>
            <div className="absolute inset-0 bg-white/40 dark:bg-gray-900/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mb-4 text-violet-600">
                    <Lock size={32} />
                </div>
                <h3 className="text-xl font-black mb-2">Premium Case</h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-6">Unlock to View Details</p>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-violet-600 text-white px-6 py-2 rounded-xl text-sm font-black shadow-lg shadow-violet-500/20 hover:scale-105 transition-transform"
                >
                    Upgrade Now
                </button>
            </div>

            <PremiumUpgradeModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                category={category}
                userEmail={userEmail}
                userName={userName}
            />
        </>
    )
}
