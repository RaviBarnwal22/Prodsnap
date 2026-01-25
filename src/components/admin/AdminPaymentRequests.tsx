'use client'

import { useState, useEffect } from 'react'
import { CreditCard, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, Calendar, Eye, X, Loader2, Search, Download } from 'lucide-react'

interface SubscriptionRequest {
    id: string
    userId: string
    name: string
    email: string
    phone: string
    paymentProof: string
    amount: number
    status: string
    adminNotes: string | null
    reviewedAt: string | null
    createdAt: string
}

export function AdminPaymentRequests() {
    const [requests, setRequests] = useState<SubscriptionRequest[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [viewingProof, setViewingProof] = useState<string | null>(null)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [selectedEndDate, setSelectedEndDate] = useState<string>('')
    const [searchQuery, setSearchQuery] = useState('')
    const [rejectingId, setRejectingId] = useState<string | null>(null)
    const [rejectionReason, setRejectionReason] = useState('')

    // Filter requests based on search query (email, name, phone)
    const filteredRequests = requests.filter(r => {
        if (!searchQuery.trim()) return true
        const query = searchQuery.toLowerCase().trim()
        return (
            (r.email || '').toLowerCase().includes(query) ||
            (r.name || '').toLowerCase().includes(query) ||
            (r.phone || '').includes(query)
        )
    })

    // Helper function to escape CSV values
    const escapeCSV = (value: string | number): string => {
        const str = String(value)
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`
        }
        return str
    }

    // Export payment requests to Excel/CSV
    const exportToExcel = () => {
        const headers = ['Name', 'Email', 'Phone', 'Amount', 'Status', 'Submitted Date', 'Reviewed Date']
        const rows = requests.map(r => [
            escapeCSV(r.name),
            escapeCSV(r.email),
            escapeCSV(r.phone),
            escapeCSV(`Rs ${r.amount}`),
            escapeCSV(r.status.charAt(0).toUpperCase() + r.status.slice(1)),
            escapeCSV(formatDate(r.createdAt)),
            escapeCSV(r.reviewedAt ? formatDate(r.reviewedAt) : 'N/A')
        ])

        // Add BOM for Excel to recognize UTF-8
        const BOM = '\uFEFF'
        const csvContent = BOM + [headers.map(h => escapeCSV(h)), ...rows].map(row => row.join(',')).join('\r\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `prodsnap_payment_requests_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = async () => {
        try {
            const response = await fetch('/api/admin/subscription-requests')
            const data = await response.json()
            if (response.ok) {
                setRequests(data.requests)
            } else {
                setError(data.error)
            }
        } catch (err) {
            setError('Failed to fetch requests')
        } finally {
            setIsLoading(false)
        }
    }

    const handleAction = async (requestId: string, action: 'approve' | 'reject', rejectionReason?: string) => {
        setProcessingId(requestId)
        try {
            const response = await fetch('/api/admin/subscription-requests', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestId,
                    action,
                    endDate: action === 'approve' ? selectedEndDate || undefined : undefined,
                    rejectionReason: action === 'reject' ? rejectionReason : undefined
                })
            })

            if (response.ok) {
                fetchRequests()
                setExpandedId(null)
                setSelectedEndDate('')
                setRejectingId(null)
                setRejectionReason('')
            } else {
                const data = await response.json()
                alert(data.error)
            }
        } catch (err) {
            alert('Failed to process request')
        } finally {
            setProcessingId(null)
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

    const getDefaultEndDate = () => {
        const date = new Date()
        date.setMonth(date.getMonth() + 1)
        return date.toISOString().split('T')[0]
    }

    const pendingCount = requests.filter(r => r.status === 'pending').length
    const approvedCount = requests.filter(r => r.status === 'approved').length
    const rejectedCount = requests.filter(r => r.status === 'rejected').length

    if (isLoading) {
        return (
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-violet-400" size={24} />
            </div>
        )
    }

    return (
        <>
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-black flex items-center gap-2 text-white">
                        <CreditCard className="text-violet-400" size={20} />
                        Payment Requests
                    </h2>
                    <div className="flex items-center gap-3">
                        <div className="flex gap-2 text-xs">
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full font-bold">
                                {pendingCount} Pending
                            </span>
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full font-bold">
                                {approvedCount} Approved
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
                {/* Search Bar */}
                <div className="relative mb-4 flex gap-2">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by email, name or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/20 text-red-400 p-3 rounded-xl text-sm mb-4">
                        {error}
                    </div>
                )}

                {filteredRequests.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                        {requests.length === 0 ? 'No payment requests yet.' : `No requests found matching "${searchQuery}"`}
                    </p>
                ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                        {filteredRequests.map((req) => (
                            <div
                                key={req.id}
                                className={`rounded-xl border transition-all ${req.status === 'pending'
                                    ? 'bg-yellow-500/10 border-yellow-500/30'
                                    : req.status === 'approved'
                                        ? 'bg-green-500/10 border-green-500/30'
                                        : 'bg-red-500/10 border-red-500/30'
                                    }`}
                            >
                                <div
                                    className="p-4 cursor-pointer flex items-center justify-between"
                                    onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${req.status === 'pending' ? 'bg-yellow-600' :
                                            req.status === 'approved' ? 'bg-green-600' : 'bg-red-600'
                                            }`}>
                                            {req.name[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{req.name}</p>
                                            <p className="text-xs text-gray-400">{req.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${req.status === 'pending' ? 'bg-yellow-600 text-white' :
                                            req.status === 'approved' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                                            }`}>
                                            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                                        </span>
                                        {expandedId === req.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </div>
                                </div>

                                {expandedId === req.id && (
                                    <div className="px-4 pb-4 pt-2 border-t border-gray-700/50">
                                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                            <div>
                                                <p className="text-gray-500 text-xs uppercase tracking-wider">Phone</p>
                                                <p className="text-white font-medium">{req.phone}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-xs uppercase tracking-wider">Amount</p>
                                                <p className="text-white font-medium">₹{req.amount}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-xs uppercase tracking-wider">Submitted</p>
                                                <p className="text-white font-medium">{formatDate(req.createdAt)}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-xs uppercase tracking-wider">Payment Proof</p>
                                                <button
                                                    onClick={() => setViewingProof(req.paymentProof)}
                                                    className="flex items-center gap-1 text-violet-400 hover:text-violet-300 font-medium"
                                                >
                                                    <Eye size={14} />
                                                    View Screenshot
                                                </button>
                                            </div>
                                        </div>

                                        {req.status === 'pending' && (
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-xs text-gray-400 mb-1 block">
                                                        Subscription End Date
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={selectedEndDate || getDefaultEndDate()}
                                                        onChange={(e) => setSelectedEndDate(e.target.value)}
                                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                                                        min={new Date().toISOString().split('T')[0]}
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleAction(req.id, 'approve')}
                                                        disabled={processingId === req.id}
                                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                                    >
                                                        {processingId === req.id ? (
                                                            <Loader2 className="animate-spin" size={16} />
                                                        ) : (
                                                            <CheckCircle size={16} />
                                                        )}
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => setRejectingId(req.id)}
                                                        disabled={processingId === req.id}
                                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                                    >
                                                        <XCircle size={16} />
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {req.reviewedAt && (
                                            <p className="text-xs text-gray-500 mt-3">
                                                Reviewed on {formatDate(req.reviewedAt)}
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
                        {/* Close button - visible and fixed position */}
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
                    {/* Alternative: Click anywhere to close message */}
                    <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm">
                        Click anywhere outside or press the close button to dismiss
                    </p>
                </div>
            )}

            {/* Rejection Reason Modal */}
            {rejectingId && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80"
                    onClick={() => {
                        setRejectingId(null)
                        setRejectionReason('')
                    }}
                >
                    <div
                        className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">Reject Payment Request</h3>
                            <button
                                onClick={() => {
                                    setRejectingId(null)
                                    setRejectionReason('')
                                }}
                                className="text-gray-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-sm text-gray-400 mb-4">
                            Please provide a reason for rejecting this payment. This message will be sent to the user via email.
                        </p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="E.g., Payment screenshot is unclear, amount doesn't match, etc."
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                            rows={4}
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => {
                                    setRejectingId(null)
                                    setRejectionReason('')
                                }}
                                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-bold text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (!rejectionReason.trim()) {
                                        alert('Please provide a rejection reason')
                                        return
                                    }
                                    handleAction(rejectingId, 'reject', rejectionReason)
                                }}
                                disabled={!rejectionReason.trim() || processingId === rejectingId}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {processingId === rejectingId ? (
                                    <>
                                        <Loader2 className="animate-spin" size={16} />
                                        Rejecting...
                                    </>
                                ) : (
                                    <>
                                        <XCircle size={16} />
                                        Confirm Rejection
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
