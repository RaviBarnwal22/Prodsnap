'use client'

import { useState, useEffect } from 'react'
import { Star, Loader2, CheckCircle, MessageSquare } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function FeedbackPage() {
    const params = useParams()
    const router = useRouter()
    const bookingId = params.bookingId as string

    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [bookingInfo, setBookingInfo] = useState<{
        name: string
        email: string
        serviceType: string
        hasFeedback: boolean
    } | null>(null)

    const [rating, setRating] = useState(5)
    const [hoverRating, setHoverRating] = useState(0)
    const [feedback, setFeedback] = useState('')
    const [wouldRecommend, setWouldRecommend] = useState(true)

    useEffect(() => {
        fetchBookingInfo()
    }, [bookingId])

    const fetchBookingInfo = async () => {
        try {
            const res = await fetch(`/api/feedback?bookingId=${bookingId}`)
            const data = await res.json()

            if (res.ok) {
                setBookingInfo(data.booking)
                if (data.booking.hasFeedback) {
                    setSubmitted(true)
                }
            } else {
                setError(data.error || 'Booking not found')
            }
        } catch (err) {
            setError('Failed to load booking information')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async () => {
        if (!feedback.trim()) {
            setError('Please share your feedback')
            return
        }

        setIsSubmitting(true)
        setError('')

        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId,
                    name: bookingInfo?.name,
                    email: bookingInfo?.email,
                    rating,
                    feedback,
                    wouldRecommend
                })
            })

            const data = await res.json()

            if (res.ok) {
                setSubmitted(true)
            } else {
                setError(data.error || 'Failed to submit feedback')
            }
        } catch (err) {
            setError('Failed to submit feedback')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
                <Loader2 className="animate-spin text-purple-600" size={40} />
            </div>
        )
    }

    if (error && !bookingInfo) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">❌</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Session Not Found</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link href="/" className="text-purple-600 font-bold hover:underline">
                        Go to Homepage
                    </Link>
                </div>
            </div>
        )
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="text-green-600" size={40} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank You! 🎉</h1>
                    <p className="text-gray-600 mb-6">
                        Your feedback has been submitted successfully. We really appreciate you taking the time to share your experience!
                    </p>
                    <Link
                        href="/"
                        className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                        Back to Prodsnap
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12 px-4">
            <div className="max-w-xl mx-auto">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-center text-white">
                        <h1 className="text-3xl font-bold mb-2">Share Your Feedback</h1>
                        <p className="opacity-90">How was your {bookingInfo?.serviceType} session?</p>
                    </div>

                    <div className="p-8">
                        {/* Star Rating */}
                        <div className="mb-8 text-center">
                            <p className="text-gray-600 mb-4 font-medium">Rate your experience</p>
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="transition-transform hover:scale-110"
                                    >
                                        <Star
                                            size={40}
                                            className={`${star <= (hoverRating || rating)
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-gray-300'
                                                } transition-colors`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                {rating === 5 && 'Excellent! 🎉'}
                                {rating === 4 && 'Great! 😊'}
                                {rating === 3 && 'Good 👍'}
                                {rating === 2 && 'Fair 😐'}
                                {rating === 1 && 'Poor 😞'}
                            </p>
                        </div>

                        {/* Feedback Text */}
                        <div className="mb-6">
                            <label className="block text-gray-700 font-medium mb-2">
                                <MessageSquare size={16} className="inline mr-2" />
                                Your Feedback
                            </label>
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Tell us about your experience... What did you learn? How was the mentor?"
                                rows={5}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                            />
                        </div>

                        {/* Would Recommend */}
                        <div className="mb-8">
                            <p className="text-gray-700 font-medium mb-3">Would you recommend us to others?</p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setWouldRecommend(true)}
                                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${wouldRecommend
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    👍 Yes
                                </button>
                                <button
                                    onClick={() => setWouldRecommend(false)}
                                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${!wouldRecommend
                                            ? 'bg-red-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    👎 No
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    Submit Feedback
                                    <span>→</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
