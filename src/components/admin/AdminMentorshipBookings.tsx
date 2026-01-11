'use client'

import { useState, useEffect } from 'react'
import { GraduationCap, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, Eye, X, Loader2, Star, Search, Download, Phone, Mail, Plus, ExternalLink } from 'lucide-react'

interface MentorshipFeedback {
    id: string
    rating: number
    feedback: string
    wouldRecommend: boolean
    createdAt: string
}

interface MentorshipBooking {
    id: string
    userId: string
    name: string
    email: string
    phone: string
    serviceType: string
    paymentProof: string
    amount: number
    status: string
    adminNotes: string | null
    completedAt: string | null
    createdAt: string
    feedback: MentorshipFeedback | null
    scheduledAt: string | null
    meetingLink: string | null
}

export function AdminMentorshipBookings() {
    const [bookings, setBookings] = useState<MentorshipBooking[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [viewingProof, setViewingProof] = useState<string | null>(null)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    // Scheduling State
    const [schedulingBooking, setSchedulingBooking] = useState<MentorshipBooking | null>(null)
    const [scheduledDate, setScheduledDate] = useState('')
    const [scheduledTime, setScheduledTime] = useState('')
    const [meetingLink, setMeetingLink] = useState('')

    useEffect(() => {
        fetchBookings()
    }, [])

    const fetchBookings = async () => {
        try {
            const response = await fetch('/api/admin/mentorship-bookings')
            const data = await response.json()
            if (response.ok) {
                setBookings(data.bookings)
            } else {
                setError(data.error)
            }
        } catch (err) {
            setError('Failed to fetch bookings')
        } finally {
            setIsLoading(false)
        }
    }

    const handleAction = async (bookingId: string, action: 'approve' | 'complete' | 'cancel', extraData: any = {}) => {
        setProcessingId(bookingId)
        try {
            const response = await fetch('/api/admin/mentorship-bookings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId, action, ...extraData })
            })

            if (response.ok) {
                fetchBookings()
                setExpandedId(null)
            } else {
                const data = await response.json()
                alert(data.error)
            }
        } catch (err) {
            alert('Failed to process booking')
        } finally {
            setProcessingId(null)
        }
    }

    const handleConfirmSchedule = async () => {
        if (!schedulingBooking) return

        try {
            // Combine date and time
            const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`)

            await handleAction(schedulingBooking.id, 'approve', {
                scheduledAt: scheduledAt.toISOString(),
                meetingLink
            })

            setSchedulingBooking(null)
            setScheduledDate('')
            setScheduledTime('')
            setMeetingLink('')
        } catch (e) {
            alert('Invalid date/time')
        }
    }

    const formatDate = (dateStr: string) => {
        return new Intl.DateTimeFormat('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateStr))
    }

    const filteredBookings = bookings.filter(b => {
        if (!searchQuery.trim()) return true
        const query = searchQuery.toLowerCase().trim()
        return (
            b.email.toLowerCase().includes(query) ||
            b.name.toLowerCase().includes(query) ||
            b.phone.includes(query)
        )
    })

    const escapeCSV = (value: string | number): string => {
        const str = String(value)
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`
        }
        return str
    }

    const exportToExcel = () => {
        const headers = ['Name', 'Email', 'Phone', 'Service Type', 'Amount', 'Status', 'Rating', 'Booked Date', 'Completed Date']
        const rows = bookings.map(b => [
            escapeCSV(b.name),
            escapeCSV(b.email),
            escapeCSV(b.phone),
            escapeCSV(b.serviceType),
            escapeCSV(`Rs ${b.amount}`),
            escapeCSV(b.status.charAt(0).toUpperCase() + b.status.slice(1)),
            b.feedback ? `${b.feedback.rating}/5` : 'N/A',
            escapeCSV(formatDate(b.createdAt)),
            b.completedAt ? escapeCSV(formatDate(b.completedAt)) : 'N/A'
        ])

        const BOM = '\uFEFF'
        const csvContent = BOM + [headers.map(h => escapeCSV(h)), ...rows].map(row => row.join(',')).join('\r\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `prodsnap_mentorship_bookings_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const pendingCount = bookings.filter(b => b.status === 'pending').length
    const approvedCount = bookings.filter(b => b.status === 'approved').length
    const completedCount = bookings.filter(b => b.status === 'completed').length

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-600'
            case 'approved': return 'bg-blue-600'
            case 'completed': return 'bg-green-600'
            case 'cancelled': return 'bg-red-600'
            default: return 'bg-gray-600'
        }
    }

    const getStatusBg = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500/10 border-yellow-500/30'
            case 'approved': return 'bg-blue-500/10 border-blue-500/30'
            case 'completed': return 'bg-green-500/10 border-green-500/30'
            case 'cancelled': return 'bg-red-500/10 border-red-500/30'
            default: return 'bg-gray-500/10 border-gray-500/30'
        }
    }

    if (isLoading) {
        return (
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-amber-400" size={24} />
            </div>
        )
    }

    return (
        <>
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-black flex items-center gap-2 text-white">
                        <GraduationCap className="text-amber-400" size={20} />
                        Mentorship Bookings
                    </h2>
                    <div className="flex items-center gap-3">
                        <div className="flex gap-2 text-xs">
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full font-bold">
                                {pendingCount} Pending
                            </span>
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full font-bold">
                                {approvedCount} Scheduled
                            </span>
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full font-bold">
                                {completedCount} Completed
                            </span>
                        </div>
                        <button
                            onClick={exportToExcel}
                            className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-xs transition-colors"
                        >
                            <Download size={14} />
                            Export
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search by email, name or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                </div>

                {error && (
                    <div className="bg-red-500/20 text-red-400 p-3 rounded-xl text-sm mb-4">
                        {error}
                    </div>
                )}

                {filteredBookings.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                        {bookings.length === 0 ? 'No mentorship bookings yet.' : `No bookings found matching "${searchQuery}"`}
                    </p>
                ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                        {filteredBookings.map((booking) => (
                            <div
                                key={booking.id}
                                className={`rounded-xl border transition-all ${getStatusBg(booking.status)}`}
                            >
                                <div
                                    className="p-4 cursor-pointer flex items-center justify-between"
                                    onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getStatusColor(booking.status)}`}>
                                            {booking.name[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-white">{booking.name}</p>
                                                {booking.feedback && (
                                                    <div className="flex items-center gap-1 text-yellow-400">
                                                        <Star size={12} fill="currentColor" />
                                                        <span className="text-xs font-bold">{booking.feedback.rating}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400">{booking.serviceType} • ₹{booking.amount}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold text-white ${getStatusColor(booking.status)}`}>
                                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                        </span>
                                        {expandedId === booking.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </div>
                                </div>

                                {expandedId === booking.id && (
                                    <div className="px-4 pb-4 pt-2 border-t border-gray-700/50">
                                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                            <div>
                                                <p className="text-gray-500 text-xs uppercase tracking-wider flex items-center gap-1">
                                                    <Mail size={12} /> Email
                                                </p>
                                                <p className="text-white font-medium">{booking.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-xs uppercase tracking-wider flex items-center gap-1">
                                                    <Phone size={12} /> Phone
                                                </p>
                                                <p className="text-white font-medium">{booking.phone}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-xs uppercase tracking-wider">Booked On</p>
                                                <p className="text-white font-medium">{formatDate(booking.createdAt)}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-xs uppercase tracking-wider">Payment Proof</p>
                                                <button
                                                    onClick={() => setViewingProof(booking.paymentProof)}
                                                    className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium"
                                                >
                                                    <Eye size={14} />
                                                    View Screenshot
                                                </button>
                                            </div>
                                        </div>

                                        {/* Feedback Display */}
                                        {booking.feedback && (
                                            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="flex text-yellow-400">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                size={16}
                                                                fill={i < booking.feedback!.rating ? 'currentColor' : 'none'}
                                                                className={i < booking.feedback!.rating ? '' : 'text-gray-500'}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-white font-bold">{booking.feedback.rating}/5</span>
                                                    {booking.feedback.wouldRecommend && (
                                                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Would Recommend</span>
                                                    )}
                                                </div>
                                                <p className="text-gray-300 text-sm italic">"{booking.feedback.feedback}"</p>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        {booking.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setSchedulingBooking(booking)}
                                                    disabled={processingId === booking.id}
                                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    {processingId === booking.id ? (
                                                        <Loader2 className="animate-spin" size={16} />
                                                    ) : (
                                                        <CheckCircle size={16} />
                                                    )}
                                                    Approve & Schedule
                                                </button>
                                                <button
                                                    onClick={() => handleAction(booking.id, 'cancel')}
                                                    disabled={processingId === booking.id}
                                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    {processingId === booking.id ? (
                                                        <Loader2 className="animate-spin" size={16} />
                                                    ) : (
                                                        <XCircle size={16} />
                                                    )}
                                                    Cancel
                                                </button>
                                            </div>
                                        )}

                                        {booking.status === 'approved' && (
                                            <button
                                                onClick={() => handleAction(booking.id, 'complete')}
                                                disabled={processingId === booking.id}
                                                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {processingId === booking.id ? (
                                                    <Loader2 className="animate-spin" size={16} />
                                                ) : (
                                                    <CheckCircle size={16} />
                                                )}
                                                Mark as Complete (Sends Feedback Request)
                                            </button>
                                        )}

                                        {booking.completedAt && (
                                            <p className="text-xs text-gray-500 mt-3">
                                                Completed on {formatDate(booking.completedAt)}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Payment Proof Modal */}
            {viewingProof && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90"
                    onClick={() => setViewingProof(null)}
                >
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setViewingProof(null)}
                            className="absolute -top-12 right-0 bg-white text-gray-900 hover:bg-gray-200 p-2 rounded-full shadow-lg flex items-center gap-2 font-bold text-sm"
                        >
                            <X size={20} />
                            Close
                        </button>
                        <img
                            src={viewingProof}
                            alt="Payment Proof"
                            className="rounded-xl max-w-full max-h-[80vh] object-contain"
                        />
                    </div>
                    <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm">
                        Click anywhere outside to dismiss
                    </p>
                </div>
            )}
            {/* Scheduling Modal */}
            {
                schedulingBooking && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="bg-gray-800 rounded-2xl w-full max-w-md border border-gray-700 p-6 animate-in zoom-in-95 duration-200">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Clock className="text-blue-400" />
                                Schedule Session
                            </h3>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={scheduledDate}
                                        onChange={e => setScheduledDate(e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-1">Time</label>
                                    <input
                                        type="time"
                                        value={scheduledTime}
                                        onChange={e => setScheduledTime(e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-1">Google Meet Link</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="url"
                                            value={meetingLink}
                                            onChange={e => setMeetingLink(e.target.value)}
                                            placeholder="Paste Google Meet link here..."
                                            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition"
                                        />
                                        <a
                                            href="https://meet.google.com/new"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-green-600 hover:bg-green-700 text-white px-4 rounded-lg font-bold transition flex items-center justify-center gap-2 whitespace-nowrap text-sm"
                                            title="Opens meet.google.com/new to generate a fresh link"
                                        >
                                            <Plus size={16} />
                                            Create
                                            <ExternalLink size={12} />
                                        </a>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Tip: Click <strong>Create</strong> to generate a link, then copy-paste it here.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setSchedulingBooking(null)}
                                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmSchedule}
                                    disabled={!scheduledDate || !scheduledTime || !meetingLink}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold disabled:opacity-50 transition-colors"
                                >
                                    Confirm & Send
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    )
}
