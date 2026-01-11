'use client'

import { useState } from 'react'
import { Users, ChevronRight, X, Calendar, FileText, Crown, ToggleLeft, ToggleRight, Search, Download } from 'lucide-react'

interface Subscription {
    id: string;
    status: string;
    planType: string;
    endDate: Date | null;
}

interface UserWithStats {
    id: string;
    email: string;
    name: string | null;
    role: string;
    createdAt: Date;
    firstName: string | null;
    lastName: string | null;
    subscription: Subscription | null;
    _count: {
        submissions: number;
        activities: number;
    };
    submissions: unknown[];
}

function formatDate(date: Date) {
    return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(new Date(date))
}

function formatDateForInput(date: Date | null): string {
    if (!date) return ''
    const d = new Date(date)
    return d.toISOString().split('T')[0]
}

export function AdminUserList({ users }: { users: UserWithStats[] }) {
    const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null)
    const [showEndDateModal, setShowEndDateModal] = useState(false)
    const [pendingPremiumUser, setPendingPremiumUser] = useState<UserWithStats | null>(null)
    const [endDate, setEndDate] = useState('')
    const [isUpdating, setIsUpdating] = useState<string | null>(null)
    const [localUsers, setLocalUsers] = useState(users)
    const [searchQuery, setSearchQuery] = useState('')
    const [showPremiumOnly, setShowPremiumOnly] = useState(false)

    const checkIsPremium = (u: UserWithStats) => {
        return u.subscription?.status === 'active' && (!u.subscription?.endDate || new Date(u.subscription.endDate) > new Date())
    }

    // Filter users based on search query and premium filter
    const filteredUsers = localUsers.filter(u => {
        const matchesSearch = u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.firstName && u.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (u.lastName && u.lastName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesPremium = showPremiumOnly ? checkIsPremium(u) : true

        return matchesSearch && matchesPremium
    })

    // Helper function to escape CSV values
    const escapeCSV = (value: string | number): string => {
        const str = String(value)
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`
        }
        return str
    }

    // Export users to Excel/CSV
    const exportToExcel = () => {
        const headers = ['Name', 'Email', 'Role', 'Premium Status', 'Subscription End Date', 'Submissions', 'Join Date']
        const rows = localUsers.map(u => {
            const isPrem = checkIsPremium(u)
            return [
                escapeCSV(u.firstName ? `${u.firstName} ${u.lastName || ''}` : u.name || 'N/A'),
                escapeCSV(u.email),
                escapeCSV(u.role),
                escapeCSV(isPrem ? 'Active' : 'Inactive'),
                escapeCSV(u.subscription?.endDate ? formatDate(u.subscription.endDate) : 'N/A'),
                u._count.submissions,
                escapeCSV(formatDate(u.createdAt))
            ]
        })

        // Add BOM for Excel to recognize UTF-8
        const BOM = '\uFEFF'
        const csvContent = BOM + [headers.map(h => escapeCSV(h)), ...rows].map(row => row.join(',')).join('\r\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `prodsnap_users_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const isPremium = (user: UserWithStats) => {
        if (!user.subscription) return false
        if (user.subscription.status !== 'active') return false
        if (user.subscription.endDate && new Date(user.subscription.endDate) < new Date()) return false
        return true
    }

    const handleTogglePremium = async (user: UserWithStats, enable: boolean) => {
        if (enable) {
            // Show date picker modal for enabling premium
            setPendingPremiumUser(user)
            setEndDate('')
            setShowEndDateModal(true)
        } else {
            // Disable premium directly
            await updatePremiumStatus(user.id, false, null)
        }
    }

    const handleConfirmPremium = async () => {
        if (!pendingPremiumUser || !endDate) return

        await updatePremiumStatus(pendingPremiumUser.id, true, endDate)
        setShowEndDateModal(false)
        setPendingPremiumUser(null)
        setEndDate('')
    }

    const updatePremiumStatus = async (userId: string, isPremium: boolean, endDate: string | null) => {
        setIsUpdating(userId)

        try {
            const res = await fetch('/api/admin/toggle-premium', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, isPremium, endDate })
            })

            if (res.ok) {
                // Update local state
                setLocalUsers(prev => prev.map(u => {
                    if (u.id === userId) {
                        return {
                            ...u,
                            subscription: isPremium ? {
                                id: u.subscription?.id || 'new',
                                status: 'active',
                                planType: 'admin_granted',
                                endDate: endDate ? new Date(endDate) : null
                            } : u.subscription ? {
                                ...u.subscription,
                                status: 'inactive'
                            } : null
                        }
                    }
                    return u
                }))

                // Also update selected user if viewing
                if (selectedUser?.id === userId) {
                    setSelectedUser(prev => prev ? {
                        ...prev,
                        subscription: isPremium ? {
                            id: prev.subscription?.id || 'new',
                            status: 'active',
                            planType: 'admin_granted',
                            endDate: endDate ? new Date(endDate) : null
                        } : prev.subscription ? {
                            ...prev.subscription,
                            status: 'inactive'
                        } : null
                    } : null)
                }
            }
        } catch (error) {
            console.error('Failed to update premium status:', error)
        } finally {
            setIsUpdating(null)
        }
    }

    return (
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 relative">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                    <Users className="text-blue-400" size={20} />
                    User Management
                    <span className="text-sm font-normal text-gray-400">({filteredUsers.length} users)</span>
                </h2>
                <button
                    onClick={exportToExcel}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm transition-colors"
                >
                    <Download size={16} />
                    Export Excel
                </button>
            </div>

            {/* Search Bar and Filters */}
            <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by email or name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <button
                    onClick={() => setShowPremiumOnly(!showPremiumOnly)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-colors whitespace-nowrap ${showPremiumOnly
                            ? 'bg-amber-600 text-white'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                >
                    <Crown size={16} />
                    Premium Only
                </button>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredUsers.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                        {showPremiumOnly ? 'No premium users found' : `No users found matching "${searchQuery}"`}
                    </p>
                ) : filteredUsers.map((u) => (
                    <div
                        key={u.id}
                        className="w-full p-5 bg-gray-700/50 rounded-2xl hover:bg-gray-700 border border-transparent hover:border-gray-600 transition-all flex items-center justify-between group"
                    >
                        <button
                            onClick={() => setSelectedUser(u)}
                            className="flex items-center gap-4 text-left flex-1"
                        >
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600/30 to-indigo-600/30 flex items-center justify-center text-blue-400 font-bold text-lg">
                                {u.firstName ? u.firstName[0] : (u.name ? u.name[0] : u.email[0]).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    {u.firstName ? `${u.firstName} ${u.lastName || ''}` : u.name || u.email.split('@')[0]}
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${u.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' :
                                        u.role === 'EXPERT' ? 'bg-purple-500/20 text-purple-400' :
                                            'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        {u.role}
                                    </span>
                                    {isPremium(u) && (
                                        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest bg-amber-500/20 text-amber-400">
                                            <Crown size={10} />
                                            Premium
                                        </span>
                                    )}
                                </h3>
                                <p className="text-sm text-gray-400">{u.email}</p>
                            </div>
                        </button>

                        <div className="flex items-center gap-6">
                            {/* Premium Toggle */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-400">Premium</span>
                                <button
                                    onClick={() => handleTogglePremium(u, !isPremium(u))}
                                    disabled={isUpdating === u.id}
                                    className={`relative p-1 rounded-full transition-all ${isUpdating === u.id ? 'opacity-50 cursor-wait' : ''
                                        }`}
                                >
                                    {isPremium(u) ? (
                                        <ToggleRight size={32} className="text-amber-400" />
                                    ) : (
                                        <ToggleLeft size={32} className="text-gray-500" />
                                    )}
                                </button>
                            </div>

                            <div className="text-right hidden sm:block">
                                <p className="text-xl font-black text-white">{u._count.submissions}</p>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Submissions</p>
                            </div>
                            <ChevronRight size={20} className="text-gray-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                        </div>
                    </div>
                ))}
            </div>

            {/* End Date Picker Modal */}
            {showEndDateModal && pendingPremiumUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
                        <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gradient-to-r from-amber-600/20 to-amber-500/10">
                            <div className="flex items-center gap-3">
                                <Crown className="text-amber-400" size={24} />
                                <h2 className="text-xl font-black text-white">Enable Premium</h2>
                            </div>
                            <button
                                onClick={() => {
                                    setShowEndDateModal(false)
                                    setPendingPremiumUser(null)
                                }}
                                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>

                        <div className="p-6">
                            <p className="text-gray-400 mb-6">
                                Set the subscription end date for{' '}
                                <span className="font-bold text-white">
                                    {pendingPremiumUser.firstName || pendingPremiumUser.email}
                                </span>
                            </p>

                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-300 mb-2">
                                    Subscription End Date
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    User will lose premium access after this date.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowEndDateModal(false)
                                        setPendingPremiumUser(null)
                                    }}
                                    className="flex-1 px-4 py-3 bg-gray-700 text-gray-300 rounded-xl font-bold hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmPremium}
                                    disabled={!endDate}
                                    className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <Crown size={18} />
                                    Activate Premium
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Detailed User Sidebar/Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-gray-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-gray-700">
                        <div className="p-8 border-b border-gray-700 flex justify-between items-start bg-gradient-to-r from-gray-700/50 to-gray-800">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-2xl font-black tracking-tight text-white">{selectedUser.firstName} {selectedUser.lastName}</h2>
                                    <span className="text-xs font-bold px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">{selectedUser.role}</span>
                                    {isPremium(selectedUser) && (
                                        <span className="flex items-center gap-1 text-xs font-bold px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full">
                                            <Crown size={12} />
                                            Premium
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-400 font-medium">{selectedUser.email}</p>
                            </div>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <X size={24} className="text-gray-400" />
                            </button>
                        </div>

                        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {/* Premium Status Card */}
                            <div className="mb-6 p-4 bg-gradient-to-r from-amber-600/10 to-amber-500/5 rounded-2xl border border-amber-500/20">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Crown className={isPremium(selectedUser) ? 'text-amber-400' : 'text-gray-500'} size={24} />
                                        <div>
                                            <p className="font-bold text-white">Premium Status</p>
                                            <p className="text-sm text-gray-400">
                                                {isPremium(selectedUser)
                                                    ? selectedUser.subscription?.endDate
                                                        ? `Expires: ${formatDate(selectedUser.subscription.endDate)}`
                                                        : 'Active (No expiry)'
                                                    : 'Not subscribed'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleTogglePremium(selectedUser, !isPremium(selectedUser))}
                                        disabled={isUpdating === selectedUser.id}
                                        className={`px-4 py-2 rounded-xl font-bold transition-all ${isPremium(selectedUser)
                                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                            : 'bg-amber-600 text-white hover:bg-amber-500'
                                            } ${isUpdating === selectedUser.id ? 'opacity-50 cursor-wait' : ''}`}
                                    >
                                        {isUpdating === selectedUser.id ? 'Updating...' : isPremium(selectedUser) ? 'Revoke Premium' : 'Grant Premium'}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                                    <p className="text-[10px] font-black uppercase text-blue-400/60 tracking-widest mb-1">Total Submissions</p>
                                    <p className="text-3xl font-black text-blue-400">{selectedUser._count.submissions}</p>
                                </div>
                                <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                                    <p className="text-[10px] font-black uppercase text-purple-400/60 tracking-widest mb-1">Join Date</p>
                                    <p className="text-2xl font-black text-purple-400">{formatDate(selectedUser.createdAt)}</p>
                                </div>
                            </div>

                            <h3 className="font-black text-sm uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                                <FileText size={16} />
                                Case Submissions
                            </h3>

                            <div className="space-y-4">
                                {(selectedUser.submissions as Array<{ id: string; createdAt: Date; answerText: string; aiScore: string; question: { title: string } }>).map((s) => {
                                    let scoreData = { scores: { overall: 'N/A' } };
                                    try {
                                        scoreData = JSON.parse(s.aiScore || '{}');
                                    } catch { /* empty */ }

                                    return (
                                        <div key={s.id} className="p-6 bg-gray-700/50 rounded-2xl border border-gray-600 hover:border-blue-500/30 transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="font-bold text-white leading-tight mb-1">{s.question.title}</h4>
                                                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                                        <Calendar size={12} />
                                                        {formatDate(s.createdAt)}
                                                    </div>
                                                </div>
                                                <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-black">
                                                    Score: {scoreData.scores?.overall}/5
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-400 line-clamp-2 italic">
                                                &quot;{s.answerText}&quot;
                                            </p>
                                        </div>
                                    )
                                })}

                                {selectedUser.submissions.length === 0 && (
                                    <div className="py-12 text-center bg-gray-700/50 rounded-2xl border border-dashed border-gray-600">
                                        <p className="text-gray-500">This user hasn&apos;t submitted any cases yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
