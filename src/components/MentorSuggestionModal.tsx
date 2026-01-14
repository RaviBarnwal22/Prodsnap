'use client'

import { useState } from 'react'
import { X, Calendar, Sparkles, TrendingUp, Award, Star, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface MentorSuggestionModalProps {
    isOpen: boolean
    onClose: () => void
    completedSessions: number
}

export function MentorSuggestionModal({ isOpen, onClose, completedSessions }: MentorSuggestionModalProps) {
    const router = useRouter()
    const [isClosing, setIsClosing] = useState(false)

    if (!isOpen) return null

    const handleClose = () => {
        setIsClosing(true)
        setTimeout(() => {
            onClose()
            setIsClosing(false)
        }, 200)
    }

    const handleBookMentor = () => {
        router.push('/mentorship')
        handleClose()
    }

    const handleRemindLater = () => {
        // Store in localStorage to remind later
        localStorage.setItem('mentorReminderDismissed', Date.now().toString())
        handleClose()
    }

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className={`relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden transition-all duration-200 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10"
                >
                    <X size={20} className="text-gray-500" />
                </button>

                {/* Header with gradient and celebration */}
                <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 p-8 text-white text-center relative overflow-hidden">
                    {/* Animated stars */}
                    <div className="absolute inset-0 overflow-hidden">
                        <Sparkles className="absolute top-4 left-8 animate-pulse text-yellow-300" size={20} />
                        <Sparkles className="absolute top-12 right-12 animate-pulse text-yellow-200" size={16} style={{ animationDelay: '0.5s' }} />
                        <Sparkles className="absolute bottom-8 left-16 animate-pulse text-yellow-400" size={18} style={{ animationDelay: '1s' }} />
                        <Star className="absolute top-6 right-6 animate-pulse text-yellow-200" size={14} style={{ animationDelay: '0.3s' }} />
                    </div>

                    {/* Trophy Icon */}
                    <div className="relative w-20 h-20 mx-auto mb-4 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center animate-bounce" style={{ animationDuration: '2s' }}>
                        <Award size={40} className="text-yellow-300" />
                    </div>

                    <h2 className="text-2xl font-black mb-2 relative">
                        🎉 Congratulations!
                    </h2>
                    <p className="text-blue-100 text-sm relative">
                        You've completed {completedSessions} practice sessions
                    </p>
                </div>

                {/* Content */}
                <div className="p-8">
                    {/* Progress Message */}
                    <div className="mb-6">
                        <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 p-5 rounded-2xl border border-violet-100 dark:border-violet-900/30">
                            <p className="text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
                                Great progress! You're showing dedication to improving your PM skills.
                                <span className="font-bold text-violet-600 dark:text-violet-400"> Now it's time to level up with personalized mentorship!</span>
                            </p>
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-4 mb-8">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Why Book a Mentor Session?</h3>

                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                                <TrendingUp size={18} className="text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">Accelerate Your Growth</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Get expert guidance on your weak areas and fast-track your PM journey</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                <Calendar size={18} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">Personalized Feedback</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">1:1 sessions tailored to your specific goals and career stage</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                                <Award size={18} className="text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">Real Interview Prep</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Practice with experts who've been through PM interviews at top companies</p>
                            </div>
                        </div>
                    </div>

                    {/* Special Offer */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 p-4 rounded-xl mb-6">
                        <p className="text-sm font-bold text-yellow-800 dark:text-yellow-300 text-center">
                            ⭐ Limited Time: Get expert guidance to complement your practice!
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={handleBookMentor}
                            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-violet-500/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                        >
                            <Calendar size={20} />
                            Book a Mentor Session
                            <ArrowRight size={20} />
                        </button>

                        <button
                            onClick={handleRemindLater}
                            className="w-full py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium transition-colors"
                        >
                            Remind me later
                        </button>
                    </div>

                    <p className="text-xs text-gray-400 text-center mt-4">
                        Continue practicing and we'll remind you again 💪
                    </p>
                </div>
            </div>
        </div>
    )
}
