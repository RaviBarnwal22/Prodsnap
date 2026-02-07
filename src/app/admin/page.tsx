import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Users, Activity, FileText, Calendar, MessageSquare, BarChart3, ShieldCheck, LogOut, Home } from "lucide-react"
import { AdminUserList } from "@/components/admin/AdminUserList"
import { UserFeedbackList } from "@/components/admin/UserFeedbackList"
import { AdminPaymentRequests } from "@/components/admin/AdminPaymentRequests"
import { AdminMentorshipBookings } from "@/components/admin/AdminMentorshipBookings"
import { AdminSupportQueue } from "@/components/admin/AdminSupportQueue"
import { ApiUsageMonitor } from "@/components/admin/ApiUsageMonitor"
import { AdminFeedbackQueue } from "@/components/admin/AdminFeedbackQueue"
import { AdminTabs } from "@/components/admin/AdminTabs"
import { AdminNewsletter } from "@/components/admin/AdminNewsletter"


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
    const totalBookings = await prisma.mentorshipBooking.count()
    const pendingRequests = await prisma.subscriptionRequest.count({ where: { status: 'pending' } })
    const pendingBookings = await prisma.mentorshipBooking.count({ where: { status: 'pending' } })

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

    // Calculate Unique Visitors (using raw SQL for efficiency)
    const totalVisitorsRaw = await prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(DISTINCT COALESCE("userId", "ipAddress")) as count 
        FROM "UserActivity"
    `
    const totalVisitors = Number(totalVisitorsRaw[0]?.count || 0)

    const todayVisitorsRaw = await prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(DISTINCT COALESCE("userId", "ipAddress")) as count 
        FROM "UserActivity" 
        WHERE "createdAt" >= ${today}
    `
    const todayVisitors = Number(todayVisitorsRaw[0]?.count || 0)

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
                        <a href="/auth/signout" className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm transition">
                            <LogOut size={16} />
                            Sign Out
                        </a>
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

                {/* Platform Health Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-violet-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-violet-500/20 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest opacity-80 mb-1">Active Pipeline</h3>
                            <p className="text-3xl font-black">{pendingRequests + pendingBookings} Requests</p>
                            <p className="text-xs font-bold opacity-60 mt-2">Action required: {pendingRequests} Subscriptions & {pendingBookings} Sessions</p>
                        </div>
                        <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
                            <ShieldCheck size={32} />
                        </div>
                    </div>
                </div>

                {/* Tabbed Interface */}
                <AdminTabs
                    overviewContent={
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                                    <div className="flex flex-col gap-3">
                                        <div className="bg-blue-500/20 w-10 h-10 flex items-center justify-center rounded-xl text-blue-400">
                                            <Users size={20} />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-white">{users.length}</p>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Users</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                                    <div className="flex flex-col gap-3">
                                        <div className="bg-indigo-500/20 w-10 h-10 flex items-center justify-center rounded-xl text-indigo-400">
                                            <Activity size={20} />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-white">{totalVisitors}</p>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Unique Visitors</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                                    <div className="flex flex-col gap-3">
                                        <div className="bg-green-500/20 w-10 h-10 flex items-center justify-center rounded-xl text-green-400">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-white">{totalSubmissions}</p>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Case Submissions</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                                    <div className="flex flex-col gap-3">
                                        <div className="bg-cyan-500/20 w-10 h-10 flex items-center justify-center rounded-xl text-cyan-400">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-white">{totalBookings}</p>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Mentorships</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                                    <div className="flex flex-col gap-3">
                                        <div className="bg-purple-500/20 w-10 h-10 flex items-center justify-center rounded-xl text-purple-400">
                                            <BarChart3 size={20} />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-white">{totalQuestions}</p>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Live Tracks</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                                    <div className="flex flex-col gap-3">
                                        <div className="bg-orange-500/20 w-10 h-10 flex items-center justify-center rounded-xl text-orange-400">
                                            <Activity size={20} />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-white">{totalActivities}</p>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Engagement (Views)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Usage Analytics - Today, Week, Month */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 text-white">
                                    <h3 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-4">Today&apos;s Activity</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-3xl font-black">{todayUsers}</p>
                                            <p className="text-xs font-bold uppercase tracking-widest opacity-70">New Users</p>
                                        </div>
                                        <div>
                                            <p className="text-3xl font-black">{todayVisitors}</p>
                                            <p className="text-xs font-bold uppercase tracking-widest opacity-70">Visitors</p>
                                        </div>
                                        <div>
                                            <p className="text-3xl font-black">{todaySubmissions}</p>
                                            <p className="text-xs font-bold uppercase tracking-widest opacity-70">Submissions</p>
                                        </div>
                                        <div>
                                            <p className="text-3xl font-black">{todayActivities}</p>
                                            <p className="text-xs font-bold uppercase tracking-widest opacity-70">Total Views</p>
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
                        </>
                    }
                    apiUsageContent={
                        <ApiUsageMonitor />
                    }
                    usersContent={
                        <div className="space-y-8">
                            {/* Users List (Client Component) */}
                            <AdminUserList users={users.map((u: any) => ({
                                ...u,
                                lastLoginAt: u.lastLoginAt || null
                            })) as any} />

                            {/* User Feedback List */}
                            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                                <UserFeedbackList feedbacks={await (prisma as any).practiceFeedback.findMany({
                                    orderBy: { createdAt: 'desc' },
                                    include: {
                                        user: {
                                            select: {
                                                id: true,
                                                name: true,
                                                email: true
                                            }
                                        },
                                        submission: {
                                            select: {
                                                question: {
                                                    select: { title: true }
                                                }
                                            }
                                        }
                                    }
                                }) as any} />
                            </div>
                        </div>
                    }
                    supportContent={
                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Payment Requests */}
                            <AdminPaymentRequests />

                            {/* Mentorship Bookings */}
                            <AdminMentorshipBookings />

                            {/* Recent Feedback */}
                            <AdminFeedbackQueue feedbacks={[
                                ...await prisma.mentorshipFeedback.findMany({
                                    include: { booking: true },
                                    orderBy: { createdAt: 'desc' },
                                    take: 20
                                }).then(items => items.map(item => ({
                                    id: item.id,
                                    type: 'MENTORSHIP' as const,
                                    userName: item.name,
                                    userEmail: item.email,
                                    rating: item.rating,
                                    feedback: item.feedback,
                                    createdAt: item.createdAt,
                                    serviceType: item.booking.serviceType
                                }))),
                                ...await prisma.practiceFeedback.findMany({
                                    include: { user: true },
                                    orderBy: { createdAt: 'desc' },
                                    take: 20
                                }).then(items => items.map(item => ({
                                    id: item.id,
                                    type: 'APP_PRACTICE' as const,
                                    userName: item.user.name || 'Anonymous',
                                    userEmail: item.user.email,
                                    rating: item.npsScore,
                                    feedback: item.comments,
                                    createdAt: item.createdAt
                                })))
                            ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) as any} />


                            {/* Support Queue */}
                            <AdminSupportQueue submissions={contactSubmissions as any} />
                        </div>
                    }
                    newsletterContent={
                        <AdminNewsletter />
                    }
                />
            </main>
        </div>
    )
}
