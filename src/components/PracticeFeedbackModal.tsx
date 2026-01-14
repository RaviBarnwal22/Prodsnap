'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

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
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl">
                    <h2 className="text-2xl font-black text-white mb-2">🎯 How was your experience?</h2>
                    <p className="text-blue-100 text-sm">Your feedback helps us improve Prodsnap for everyone!</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* NPS Score */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                            How likely are you to recommend Prodsnap to a friend or colleague?
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Select a score from 0 (Not likely) to 10 (Extremely likely)</p>

                        <div className="grid grid-cols-11 gap-2">
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                                <button
                                    key={score}
                                    type="button"
                                    onClick={() => setNpsScore(score)}
                                    className={`
                                        h-12 rounded-lg font-bold text-sm transition-all
                                        ${npsScore === score
                                            ? score >= 9 ? 'bg-green-600 text-white scale-110'
                                                : score >= 7 ? 'bg-yellow-500 text-white scale-110'
                                                    : 'bg-red-500 text-white scale-110'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }
                                    `}
                                >
                                    {score}
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>Not likely</span>
                            <span>Extremely likely</span>
                        </div>
                    </div>

                    {/* Experience Rating */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                            How would you rate your overall experience with this practice session?
                        </label>

                        <div className="grid grid-cols-5 gap-3">
                            {['😫 Poor', '😕 Fair', '😊 Good', '😃 Great', '🤩 Excellent'].map((rating, index) => (
                                <button
                                    key={rating}
                                    type="button"
                                    onClick={() => setExperience(rating)}
                                    className={`
                                        p-3 rounded-lg border-2 transition-all text-center text-sm font-medium
                                        ${experience === rating
                                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 text-gray-700 dark:text-gray-300'
                                        }
                                    `}
                                >
                                    {rating}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Comments */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                            Any additional comments or suggestions? (Optional)
                        </label>
                        <textarea
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="Share your thoughts, suggestions, or anything we can improve..."
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting || npsScore === null || !experience}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                        <button
                            type="button"
                            onClick={handleSkip}
                            className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            Skip
                        </button>
                    </div>

                    <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                        Thank you for helping us improve! 🙏
                    </p>
                </form>
            </div>
        </div>
    )
}
