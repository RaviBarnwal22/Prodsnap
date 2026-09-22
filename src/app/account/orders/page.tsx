import Link from 'next/link'
import { Calendar, Video } from 'lucide-react'
import { getUser } from '@/lib/auth'
import { getMyOrders } from '@/lib/account'
import { formatPriceINR } from '@/lib/constants'

export const dynamic = 'force-dynamic'

const STATUS_STYLES: Record<string, string> = {
    confirmed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    completed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
}

const dateFmt = (d: Date) =>
    d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

const dateTimeFmt = (d: Date) =>
    d.toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
    })

export default async function OrdersPage() {
    const user = await getUser()
    if (!user) return null

    const orders = await getMyOrders({ id: user.id, email: user.email })

    if (orders.length === 0) {
        return (
            <section>
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6">Orders</h2>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-10 text-center">
                    <p className="text-gray-600 dark:text-gray-300 font-medium mb-1">No orders yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Your mentorship bookings will appear here once you book a session.
                    </p>
                    <Link
                        href="/mentorship"
                        className="inline-flex items-center gap-2 bg-violet-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-violet-700 transition"
                    >
                        Browse mentorship packages
                    </Link>
                </div>
            </section>
        )
    }

    return (
        <section>
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6">
                Orders <span className="text-gray-400 font-bold">({orders.length})</span>
            </h2>

            <ul className="space-y-4">
                {orders.map((order) => {
                    const status = order.status.toLowerCase()
                    return (
                        <li
                            key={order.id}
                            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 md:p-6"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                                <div className="min-w-0">
                                    <h3 className="font-black text-gray-900 dark:text-white">{order.serviceType}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Booked {dateFmt(order.createdAt)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className="font-black text-violet-600 dark:text-violet-400">
                                        {formatPriceINR(order.amount)}
                                    </span>
                                    <span
                                        className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${STATUS_STYLES[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                                            }`}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            {(order.scheduledAt || order.meetingLink) && (
                                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3 border-t border-gray-100 dark:border-gray-800 text-sm">
                                    {order.scheduledAt && (
                                        <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                                            <Calendar size={15} className="text-gray-400" />
                                            {dateTimeFmt(order.scheduledAt)}
                                        </span>
                                    )}
                                    {order.meetingLink && (
                                        <a
                                            href={order.meetingLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-violet-600 font-bold hover:underline"
                                        >
                                            <Video size={15} />
                                            Join meeting
                                        </a>
                                    )}
                                </div>
                            )}

                            {status === 'confirmed' && !order.scheduledAt && (
                                <p className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
                                    Payment confirmed. Book your time slot from the link in your confirmation email.
                                </p>
                            )}
                        </li>
                    )
                })}
            </ul>
        </section>
    )
}
