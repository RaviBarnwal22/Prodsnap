import Link from 'next/link'
import { getUser } from '@/lib/auth'
import { getMySubscription, isSubscriptionActive } from '@/lib/account'
import { formatPriceINR, SUBSCRIPTION_PRICE } from '@/lib/constants'

export const dynamic = 'force-dynamic'

const dateFmt = (d: Date) =>
    d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

export default async function SubscriptionPage() {
    const user = await getUser()
    if (!user) return null

    const sub = await getMySubscription({ id: user.id })
    const active = isSubscriptionActive(sub)

    return (
        <section>
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6">Subscription</h2>

            {active && sub ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-violet-200 dark:border-violet-900/50 p-6">
                    <div className="flex items-center justify-between gap-4 mb-5">
                        <div>
                            <p className="font-black text-lg text-gray-900 dark:text-white capitalize">
                                {sub.planType} plan
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                {formatPriceINR(sub.priceINR)} per month
                            </p>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                            Active
                        </span>
                    </div>

                    <dl className="grid sm:grid-cols-2 gap-4 pt-5 border-t border-gray-100 dark:border-gray-800 text-sm">
                        {sub.startDate && (
                            <div>
                                <dt className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Started</dt>
                                <dd className="text-gray-900 dark:text-white font-medium">{dateFmt(sub.startDate)}</dd>
                            </div>
                        )}
                        {sub.endDate && (
                            <div>
                                <dt className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Renews / expires</dt>
                                <dd className="text-gray-900 dark:text-white font-medium">{dateFmt(sub.endDate)}</dd>
                            </div>
                        )}
                    </dl>
                </div>
            ) : (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center">
                    <p className="font-black text-gray-900 dark:text-white mb-1">
                        {sub ? 'Your subscription has ended' : 'No active subscription'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                        Go premium for {formatPriceINR(SUBSCRIPTION_PRICE)} a month and practise unlimited PM cases with instant AI feedback.
                    </p>
                    {sub?.endDate && (
                        <p className="text-xs text-gray-400 mb-5">Previous plan ended {dateFmt(sub.endDate)}</p>
                    )}
                    <Link
                        href="/practice"
                        className="inline-flex items-center gap-2 bg-violet-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-violet-700 transition"
                    >
                        Go premium
                    </Link>
                </div>
            )}
        </section>
    )
}
