'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface PracticeFeedbackModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: { experience: string; comments: string; npsScore: number }) => Promise<void>
}

export function PracticeFeedbackModal({ isOpen, onClose, onSubmit }: PracticeFeedbackModalProps) {
    const [npsScore, setNpsScore] = useState<number | null>(null)
    const [experience, setExperience] = useState('')
    const [comments, setComments] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (npsScore === null) {
            alert('Please select a score')
            return
        }

        setIsSubmitting(true)
        try {
            await onSubmit({ experience, comments, npsScore })
            onClose()
        } catch (error) {
            console.error('Failed to submit feedback:', error)
            alert('Failed to submit feedback. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSkip = () => {
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto relative">
                {/* Close Button */}
                <button
                    onClick={handleSkip}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10"
                >
                    <X size={18} />
                </button>

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-t-xl">
                    <h2 className="text-lg font-bold text-white">🎯 Quick Feedback</h2>
                    <p className="text-blue-100 text-xs">Help us improve Prodsnap!</p>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* NPS Score */}
                    <div>
                        <label className="block text-xs font-bold text-gray-900 dark:text-white mb-2">
                            Would you recommend Prodsnap?
                        </label>
                        <div className="grid grid-cols-11 gap-1">
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                                <button
                                    key={score}
                                    type="button"
                                    onClick={() => setNpsScore(score)}
                                    className={`
                                        h-8 rounded text-xs font-bold transition-all
                                        ${npsScore === score
                                            ? score >= 9 ? 'bg-green-600 text-white scale-110'
                                                : score >= 7 ? 'bg-yellow-500 text-white scale-110'
                                                    : 'bg-red-500 text-white scale-110'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                                        }
                                    `}
                                >
                                    {score}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-between mt-1 text-[10px] text-gray-400">
                            <span>Not likely</span>
                            <span>Very likely</span>
                        </div>
                    </div>

                    {/* Experience Rating */}
                    <div>
                        <label className="block text-xs font-bold text-gray-900 dark:text-white mb-2">
                            Rate this session
                        </label>
                        <div className="grid grid-cols-5 gap-1.5">
                            {['😫', '😕', '😊', '😃', '🤩'].map((emoji, index) => (
                                <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => setExperience(['Poor', 'Fair', 'Good', 'Great', 'Excellent'][index])}
                                    className={`
                                        p-2 rounded-lg border transition-all text-center text-lg
                                        ${experience === ['Poor', 'Fair', 'Good', 'Great', 'Excellent'][index]
                                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 scale-110'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                        }
                                    `}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Comments */}
                    <div>
                        <label className="block text-xs font-bold text-gray-900 dark:text-white mb-1">
                            Any suggestions? <span className="font-normal text-gray-400">(Optional)</span>
                        </label>
                        <textarea
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="Share your thoughts..."
                            rows={2}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting || npsScore === null || !experience}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-2.5 px-4 rounded-lg transition-colors text-sm"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
                        <button
                            type="button"
                            onClick={handleSkip}
                            className="px-4 py-2.5 text-gray-500 font-medium text-sm hover:text-gray-700 dark:hover:text-gray-300"
                        >
                            Skip
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
