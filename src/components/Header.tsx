import Link from 'next/link'
import Image from 'next/image'
import { getUser } from '@/lib/auth'
import { MobileMenu } from './MobileMenu'
import { Navigation } from './Navigation'

export async function Header() {
    const user = await getUser()

    return (
        <header className="border-b bg-white dark:bg-gray-900 sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight">
                    <Image src="/logo.png" alt="Prodsnap" width={36} height={36} className="rounded-lg" />
                    <span>Prod<span className="text-violet-600">snap</span></span>
                </Link>

                <Navigation />

                <div className="flex items-center gap-2">
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                {user.email === 'ravibarnwal89@gmail.com' && (
                                    <Link
                                        href="/admin"
                                        className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors flex items-center gap-1.5"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                        Admin Panel
                                    </Link>
                                )}
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium">{user.firstName || user.name?.split(' ')[0] || user.email.split('@')[0]}</span>
                                    <a href="/auth/signout" className="text-xs text-gray-500 hover:text-red-500 transition">Log Out</a>
                                </div>
                            </div>
                        ) : (
                            <Link href="/login" className="bg-violet-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-violet-700 transition">
                                Sign In
                            </Link>
                        )}
                    </div>
                    <MobileMenu
                        isLoggedIn={!!user}
                        userName={user?.firstName || user?.name || user?.email}
                    />
                </div>
            </div>
        </header>
    )
}
