'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface MobileMenuProps {
    isLoggedIn: boolean
    userName?: string
}

export function MobileMenu({ isLoggedIn, userName }: MobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()

    const toggleMenu = () => setIsOpen(!isOpen)

    const navLinks = [
        { name: 'About Us', href: '/about' },
        { name: 'Case Simulator', href: '/practice' },
        { name: 'Mentorship', href: '/mentorship' },
        { name: 'Community', href: '/community' },
        { name: 'Blog', href: '/blog' },
        { name: 'Contact Us', href: '/contact' },
    ]

    return (
        <div className="md:hidden">
            <button
                onClick={toggleMenu}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-violet-600 transition"
                aria-label="Toggle Menu"
            >
                {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={toggleMenu}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                        />

                        {/* Menu Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 h-full w-[280px] bg-white dark:bg-gray-950 z-50 shadow-2xl p-6 flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <span className="font-black text-xl tracking-tight">
                                    Prod<span className="text-violet-600">snap</span>
                                </span>
                                <button onClick={toggleMenu} className="p-2 text-gray-500 hover:text-red-500 transition">
                                    <X size={24} />
                                </button>
                            </div>

                            <nav className="flex flex-col gap-1 mb-8">
                                {navLinks.map((link) => {
                                    const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
                                    return (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            onClick={toggleMenu}
                                            className={`py-4 px-4 rounded-xl text-lg font-bold transition-all flex items-center justify-between group ${isActive
                                                ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600'
                                                : 'text-gray-700 dark:text-gray-200 hover:bg-violet-50 dark:hover:bg-violet-900/10 hover:text-violet-600'
                                                }`}
                                        >
                                            {link.name}
                                            <ArrowRight size={18} className={`${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'} transition-all`} />
                                        </Link>
                                    )
                                })}
                            </nav>

                            <div className="mt-auto border-t pt-8">
                                {isLoggedIn ? (
                                    <div className="space-y-4">
                                        <div className="px-4">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Signed in as</p>
                                            <p className="font-bold text-gray-900 dark:text-white truncate">{userName}</p>
                                        </div>
                                        <a
                                            href="/auth/signout"
                                            className="block w-full text-center py-4 bg-gray-100 dark:bg-gray-800 rounded-2xl font-bold text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                        >
                                            Log Out
                                        </a>
                                    </div>
                                ) : (
                                    <Link
                                        href="/login"
                                        onClick={toggleMenu}
                                        className="block w-full text-center py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-violet-500/30 transition-all"
                                    >
                                        Sign In
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
