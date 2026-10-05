export const dynamic = 'force-dynamic'
import { prisma } from "@/lib/prisma"
import { getUser, isOwner } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ShieldCheck, LogOut, Home, Brain } from "lucide-react"
import { AdminUserList } from "@/components/admin/AdminUserList"
import { UserFeedbackList } from "@/components/admin/UserFeedbackList"
import { AdminPaymentRequests } from "@/components/admin/AdminPaymentRequests"
import { AdminMentorshipBookings } from "@/components/admin/AdminMentorshipBookings"
import { AdminSupportQueue } from "@/components/admin/AdminSupportQueue"
import { ApiUsageMonitor } from "@/components/admin/ApiUsageMonitor"
import { AdminFeedbackQueue } from "@/components/admin/AdminFeedbackQueue"
import { AdminTabs } from "@/components/admin/AdminTabs"
import { AdminMetricsPanel } from "@/components/admin/AdminMetricsPanel"
import { getAdminMetrics } from "@/lib/admin-metrics"



export default async function AdminPage() {
    const user = await getUser()

    // Owner only: stricter than role ADMIN.
    if (!isOwner(user)) {
        redirect('/admin/login')
    }

    const metrics = await getAdminMetrics()

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

    // Counts still shown in the pipeline banner above the tabs.
    const pendingRequests = await prisma.subscriptionRequest.count({ where: { status: 'pending' } })
    const pendingBookings = await prisma.mentorshipBooking.count({ where: { status: 'pending' } })

    // Contact submissions
    const contactSubmissions = await prisma.contactSubmission.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10
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
                        <Link href="/admin/ai-coach" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-bold transition bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 mr-2">
                            <Brain size={16} />
                            AI Coach
                        </Link>
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
                            <AdminMetricsPanel metrics={metrics} />
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

                />
            </main>
        </div>
    )
}
