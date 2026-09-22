import { getUser } from '@/lib/auth'
import { getMySubscription, isSubscriptionActive } from '@/lib/account'

export const dynamic = 'force-dynamic'

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div className="py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
            <dt className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">{label}</dt>
            <dd className="text-gray-900 dark:text-white font-medium break-words">{value}</dd>
        </div>
    )
}

export default async function ProfilePage() {
    // The layout already redirects when signed out; this re-read is request-cached.
    const user = await getUser()
    if (!user) return null

    const subscription = await getMySubscription({ id: user.id })
    const active = isSubscriptionActive(subscription)

    const fullName =
        [user.firstName, user.lastName].filter(Boolean).join(' ') || user.name || '—'

    return (
        <section>
            <div className="flex items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-black text-gray-900 dark:text-white">Profile</h2>
                <span
                    className={`text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${active
                        ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                        }`}
                >
                    {active ? 'Premium' : 'Free'}
                </span>
            </div>

            <dl className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 px-6">
                <Field label="Name" value={fullName} />
                <Field label="Email" value={user.email} />
                <Field
                    label="Member since"
                    value={user.createdAt.toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                    })}
                />
            </dl>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-5">
                Need something changed? <a href="/contact" className="text-violet-600 font-bold hover:underline">Contact us</a> and we&apos;ll update it for you.
            </p>
        </section>
    )
}
