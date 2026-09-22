'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Receipt, CreditCard } from 'lucide-react'

const ITEMS = [
    { href: '/account', label: 'Profile', icon: User },
    { href: '/account/orders', label: 'Orders', icon: Receipt },
    { href: '/account/subscription', label: 'Subscription', icon: CreditCard },
]

export function AccountNav() {
    const pathname = usePathname()

    return (
        <nav aria-label="Account sections">
            {/* Horizontal on mobile, vertical sidebar from md up. */}
            <ul className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                {ITEMS.map(({ href, label, icon: Icon }) => {
                    // '/account' is the profile page, so it must match exactly or
                    // it would stay highlighted on every child route.
                    const isActive = href === '/account' ? pathname === href : pathname.startsWith(href)

                    return (
                        <li key={href} className="shrink-0">
                            <Link
                                href={href}
                                aria-current={isActive ? 'page' : undefined}
                                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${isActive
                                    ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <Icon size={17} />
                                {label}
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}
