import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
    return (
        <footer className="bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 py-14">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
                    <div className="lg:col-span-2">
                        <Link href="/" className="flex items-center gap-3 font-bold text-2xl tracking-tight mb-4">
                            <Image src="/logo.png" alt="Prodsnap" width={40} height={40} className="rounded-xl shadow-md" />
                            <span>Prod<span className="text-violet-600">snap</span></span>
                        </Link>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm text-sm leading-relaxed mb-6">
                            The interactive preparation platform for Product Managers. Practice real-world cases with instant AI coaching, master mental models, and accelerate your career.
                        </p>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-800">
                            Built for ambitious PMs worldwide
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-xs uppercase tracking-widest text-gray-900 dark:text-white mb-4">Platform</h4>
                        <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
                            <li><Link href="/practice" className="hover:text-violet-600 transition">Case Simulator</Link></li>
                            <li><Link href="/practice?category=CONSUMER_PRODUCT_DESIGN" className="hover:text-violet-600 transition">Product Sense Practice</Link></li>
                            <li><Link href="/practice?category=ROOT_CAUSE_ANALYSIS" className="hover:text-violet-600 transition">RCA Drills</Link></li>
                            <li><Link href="/practice?category=METRICS" className="hover:text-violet-600 transition">Metrics & North Star</Link></li>
                            <li><Link href="/mentorship" className="hover:text-violet-600 transition">1:1 Mentorship</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-xs uppercase tracking-widest text-gray-900 dark:text-white mb-4">PM Guides & Hubs</h4>
                        <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
                            <li><Link href="/product-management" className="hover:text-violet-600 transition">What is Product Management?</Link></li>
                            <li><Link href="/product-management-interview" className="hover:text-violet-600 transition">Interview Prep Hub</Link></li>
                            <li><Link href="/frameworks" className="hover:text-violet-600 transition">PM Frameworks (RICE, Kano)</Link></li>
                            <li><Link href="/product-analytics" className="hover:text-violet-600 transition">Product Analytics & Metrics</Link></li>
                            <li><Link href="/templates" className="hover:text-violet-600 transition">PRD & Roadmap Templates</Link></li>
                            <li><Link href="/glossary" className="hover:text-violet-600 transition">Product Management Glossary</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-xs uppercase tracking-widest text-gray-900 dark:text-white mb-4">Company</h4>
                        <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
                            <li><Link href="/about" className="hover:text-violet-600 transition">About Us</Link></li>
                            <li><Link href="/community" className="hover:text-violet-600 transition">Case Studies & Blogs</Link></li>
                            <li><Link href="/contact" className="hover:text-violet-600 transition">Contact Us</Link></li>
                            <li><Link href="/privacy" className="hover:text-violet-600 transition">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-violet-600 transition">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
                    <div className="flex flex-col gap-1 text-center md:text-left">
                        <p>&copy; {new Date().getFullYear()} Prodsnap. All rights reserved.</p>
                        <p className="italic opacity-60">Evaluations and case answers are provided for educational interview practice purposes.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/admin/login" className="text-gray-400 hover:text-violet-600 transition-colors italic">Admin Login</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
