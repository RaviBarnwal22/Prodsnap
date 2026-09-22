import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AccountNav } from '@/components/account/AccountNav'
import { getUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: 'My Account | Prodsnap',
    // Personal, per-user pages. Never indexable.
    robots: { index: false, follow: false },
}

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
    // middleware.ts already redirects signed-out visitors, but every route
    // authenticates itself rather than inheriting protection — if the matcher
    // ever changes, this must still fail closed.
    const user = await getUser()
    if (!user) redirect('/login?redirectedFrom=/account')

    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
            <Header />
            <main className="flex-grow container mx-auto max-w-5xl px-4 py-10 md:py-14">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-8">
                    My Account
                </h1>

                <div className="grid md:grid-cols-[210px_1fr] gap-6 md:gap-10 items-start">
                    <aside className="md:sticky md:top-24">
                        <AccountNav />
                    </aside>
                    <div className="min-w-0">{children}</div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
