import Link from 'next/link'
import Image from 'next/image'
import { getUser } from '@/lib/auth'

export async function Header() {
    const user = await getUser()

    return (
        <header className="border-b bg-white dark:bg-gray-900 sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight">
                    <Image src="/logo.png" alt="Prodsnap" width={36} height={36} className="rounded-lg" />
                    Prod<span className="text-blue-600">snap</span>
                </Link>

                <nav className="hidden md:flex gap-8 text-[13px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <Link href="/practice" className="hover:text-blue-600 transition-colors">Practice</Link>
                    {/* <Link href="/prodsense" className="hover:text-blue-600 transition-colors">Prodsense</Link> */}
                    <Link href="/mentorship" className="hover:text-blue-600 transition-colors">Mentorship</Link>
                    <Link href="/community" className="hover:text-blue-600 transition-colors">Community</Link>
                    <Link href="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
                    <Link href="/contact" className="hover:text-blue-600 transition-colors">Contact Us</Link>
                </nav>

                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">{user.firstName || user.name?.split(' ')[0] || user.email.split('@')[0]}</span>
                            <Link href="/auth/signout" className="text-xs text-gray-500 hover:text-red-500 transition">Log Out</Link>
                        </div>
                    ) : (
                        <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition">
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </header>
    )
}
