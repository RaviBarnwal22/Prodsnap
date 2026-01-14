import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Users, Activity, FileText, Calendar, MessageSquare, BarChart3, ShieldCheck, LogOut, Home } from "lucide-react"
import { AdminUserList } from "@/components/admin/AdminUserList"
import { AdminPaymentRequests } from "@/components/admin/AdminPaymentRequests"
import { AdminMentorshipBookings } from "@/components/admin/AdminMentorshipBookings"

// Helper to format date
function formatDate(date: Date) {
    return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date)
}

// Get last N days
function getLastNDays(n: number) {
    const dates = []
    for (let i = n - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        date.setHours(0, 0, 0, 0)
        dates.push(date)
    }
    return dates
}

export default async function AdminPage() {
    const user = await getUser()

    // Check if user is admin OR specifically ravibarnwal89@gmail.com
    const isAdminEmail = user?.email === 'ravibarnwal89@gmail.com'
    if (!user || (!isAdminEmail && user.role !== 'ADMIN')) {
        redirect('/admin/login')
    }

    // Fetch all users with all submissions for detailed checking
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            submissions: {
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    createdAt: true,
                    answerText: true,
                    aiScore: true,
                    timeSpent: true,
                    isGoldStandard: true,
                    question: { select: { title: true } },
                    reviews: {
                        where: { type: 'EXPERT' },
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                        select: {
                            score: true,
                            aiAccuracy: true,
                            content: true
                        }
                    }
                }
            },
            subscription: true,
            _count: {
                select: { submissions: true, activities: true }
            }
        }
    })

    // Fetch submissions stats
    const totalSubmissions = await prisma.practiceSubmission.count()
    const totalQuestions = await prisma.practiceQuestion.count()
    const totalActivities = await prisma.userActivity.count()

    // Contact submissions
    const contactSubmissions = await prisma.contactSubmission.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10
    })

    // Daily user signups (last 7 days)
    const last7Days = getLastNDays(7)
    const usersByDay = await Promise.all(
        last7Days.map(async (date) => {
            const nextDay = new Date(date)
            nextDay.setDate(nextDay.getDate() + 1)
            const count = await prisma.user.count({
                where: {
                    createdAt: {
                        gte: date,
                        lt: nextDay
                    }
                }
            })
            return {
                date: date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
                count
            }
        })
    )

    // Recent activities (limited for log view)
    const recentActivities = await prisma.userActivity.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { user: true }
    })

    // Today's stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayUsers = await prisma.user.count({
        where: { createdAt: { gte: today } }
    })
    const todaySubmissions = await prisma.practiceSubmission.count({
        where: { createdAt: { gte: today } }
    })
    const todayActivities = await prisma.userActivity.count({
        where: { createdAt: { gte: today } }
    })

    // This week's stats
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - 7)
    weekStart.setHours(0, 0, 0, 0)
    const weekUsers = await prisma.user.count({
        where: { createdAt: { gte: weekStart } }
    })
    const weekSubmissions = await prisma.practiceSubmission.count({
        where: { createdAt: { gte: weekStart } }
    })

    // This month's stats
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    const monthUsers = await prisma.user.count({
        where: { createdAt: { gte: monthStart } }
    })
    const monthSubmissions = await prisma.practiceSubmission.count({
        where: { createdAt: { gte: monthStart } }
    })

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Admin Header - Clean, no normal user views */}
            <header className="bg-gray-950 border-b border-gray-800 sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight text-white">
                            <Image src="/logo.png" alt="Prodsnap" width={36} height={36} className="rounded-lg" />
                            Prod<span className="text-blue-500">snap</span>
                        </Link>
                        <div className="h-6 w-px bg-gray-700"></div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">
                            <ShieldCheck size={14} />
                            Admin
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition">
                            <Home size={16} />
                            View Site
                        </Link>
                        <Link href="/auth/signout" className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm transition">
                            <LogOut size={16} />
                            Sign Out
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* Admin Header */}
                <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight mb-2 text-white">
                            Admin <span className="text-blue-500">Dashboard</span>
                        </h1>
                        <p className="text-gray-400 font-medium">Monitoring platform growth and user performance.</p>
                    </div>
                    <div className="p-4 bg-gray-800 rounded-2xl border border-gray-700 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-lg font-black text-white">
                            {user.firstName?.[0] || user.email[0].toUpperCase()}
                        </div>
                        <div>
                            <p className="font-bold leading-tight text-white">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-500/20 w-12 h-12 flex items-center justify-center rounded-xl text-blue-400">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-3xl font-black text-white">{users.length}</p>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Users</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                        <div className="flex items-center gap-4">
                            <div className="bg-green-500/20 w-12 h-12 flex items-center justify-center rounded-xl text-green-400">
                                <FileText size={24} />
                            </div>
                            <div>
                                <p className="text-3xl font-black text-white">{totalSubmissions}</p>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Submissions</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                        <div className="flex items-center gap-4">
                            <div className="bg-purple-500/20 w-12 h-12 flex items-center justify-center rounded-xl text-purple-400">
                                <BarChart3 size={24} />
                            </div>
                            <div>
                                <p className="text-3xl font-black text-white">{totalQuestions}</p>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Questions</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                        <div className="flex items-center gap-4">
                            <div className="bg-orange-500/20 w-12 h-12 flex items-center justify-center rounded-xl text-orange-400">
                                <Activity size={24} />
                            </div>
                            <div>
                                <p className="text-3xl font-black text-white">{totalActivities}</p>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Page Views</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Usage Analytics - Today, Week, Month */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 text-white">
                        <h3 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-4">Today&apos;s Activity</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-3xl font-black">{todayUsers}</p>
                                <p className="text-xs font-bold uppercase tracking-widest opacity-70">Users</p>
                            </div>
                            <div>
                                <p className="text-3xl font-black">{todaySubmissions}</p>
                                <p className="text-xs font-bold uppercase tracking-widest opacity-70">Cases</p>
                            </div>
                            <div>
                                <p className="text-3xl font-black">{todayActivities}</p>
                                <p className="text-xs font-bold uppercase tracking-widest opacity-70">Views</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
                        <h3 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-4">This Week (7 Days)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-3xl font-black">{weekUsers}</p>
                                <p className="text-xs font-bold uppercase tracking-widest opacity-70">Users</p>
                            </div>
                            <div>
                                <p className="text-3xl font-black">{weekSubmissions}</p>
                                <p className="text-xs font-bold uppercase tracking-widest opacity-70">Cases</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-600 to-pink-700 rounded-2xl p-6 text-white">
                        <h3 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-4">This Month</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-3xl font-black">{monthUsers}</p>
                                <p className="text-xs font-bold uppercase tracking-widest opacity-70">Users</p>
                            </div>
                            <div>
                                <p className="text-3xl font-black">{monthSubmissions}</p>
                                <p className="text-xs font-bold uppercase tracking-widest opacity-70">Cases</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main User List Section - 2 columns span */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Users List (Client Component) */}
                        <AdminUserList users={users} />

                        {/* Daily Signups Chart */}
                        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                            <h2 className="text-lg font-black mb-6 flex items-center gap-2 text-white">
                                <Calendar className="text-blue-400" size={20} />
                                User Signup Trajectory (7 Days)
                            </h2>
                            <div className="flex items-end gap-4 h-40 px-4">
                                {usersByDay.map((day, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center group">
                                        <div className="invisible group-hover:visible mb-2 px-2 py-1 bg-white text-gray-900 text-xs rounded-lg font-bold">
                                            {day.count}
                                        </div>
                                        <div
                                            className="w-full bg-blue-500/30 rounded-t-lg group-hover:bg-blue-500 transition-all duration-300"
                                            style={{
                                                height: `${Math.max(day.count * 30, 8)}px`,
                                            }}
                                        ></div>
                                        <p className="text-xs font-bold text-gray-500 mt-3">{day.date}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar section - 1 column span */}
                    <div className="space-y-8">
                        {/* Payment Requests */}
                        <AdminPaymentRequests />

                        {/* Mentorship Bookings */}
                        <AdminMentorshipBookings />

                        {/* Recent Activity */}
                        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                            <h2 className="text-lg font-black mb-6 flex items-center gap-2 text-white">
                                <Activity className="text-green-400" size={20} />
                                Activity Log
                            </h2>
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                {recentActivities.map((activity) => (
                                    <div key={activity.id} className="p-3 bg-gray-700/50 rounded-xl">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className={`w-2 h-2 rounded-full ${activity.action === 'login' ? 'bg-green-500' :
                                                activity.action === 'page_view' ? 'bg-blue-500' :
                                                    activity.action === 'submission' ? 'bg-purple-500' :
                                                        'bg-gray-400'
                                                }`}></div>
                                            <p className="text-xs font-bold uppercase text-gray-400">
                                                {activity.action}
                                            </p>
                                        </div>
                                        <p className="text-sm font-medium text-white truncate">
                                            {activity.user?.email || 'Anonymous'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatDate(activity.createdAt)}
                                        </p>
                                    </div>
                                ))}
                                {recentActivities.length === 0 && (
                                    <p className="text-gray-500 text-center py-8">No activity recorded yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Contact Submissions */}
                        {contactSubmissions.length > 0 && (
                            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                                <h2 className="text-lg font-black mb-6 flex items-center gap-2 text-white">
                                    <MessageSquare className="text-orange-400" size={20} />
                                    Support Queue ({contactSubmissions.length})
                                </h2>
                                <div className="space-y-3">
                                    {contactSubmissions.slice(0, 5).map((c) => (
                                        <div key={c.id} className="p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
                                            <div className="flex justify-between mb-2">
                                                <p className="text-sm font-bold text-orange-400">{c.name}</p>
                                                <p className="text-xs text-gray-500">{formatDate(c.createdAt)}</p>
                                            </div>
                                            <p className="text-sm text-white mb-1">{c.email}</p>
                                            <p className="text-xs text-gray-400 line-clamp-2">&quot;{c.message}&quot;</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
