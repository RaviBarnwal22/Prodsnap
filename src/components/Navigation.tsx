'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavLinkProps {
    href: string;
    children: React.ReactNode;
}

function NavLink({ href, children }: NavLinkProps) {
    const pathname = usePathname()
    const isActive = pathname === href ||
        (href !== '/' && pathname?.startsWith(href)) ||
        (href === '/community' && pathname?.startsWith('/blog'))

    return (
        <Link
            href={href}
            className={`transition-colors relative py-1 ${isActive
                ? 'text-violet-600 font-black'
                : 'text-gray-500 dark:text-gray-400 hover:text-violet-600'
                }`}
        >
            {children}
            {isActive && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-violet-600 rounded-full" />
            )}
        </Link>
    )
}

export function Navigation() {
    return (
        <nav className="hidden md:flex gap-8 text-[13px] font-bold uppercase tracking-wider">
            <NavLink href="/about">About Us</NavLink>
            <NavLink href="/practice">Case Simulator</NavLink>
            <NavLink href="/mentorship">Mentorship</NavLink>
            <NavLink href="/community">Community & Blogs</NavLink>
            <NavLink href="/ai-news">AI Daily</NavLink>
            <NavLink href="/contact">Contact Us</NavLink>
        </nav>
    )
}
