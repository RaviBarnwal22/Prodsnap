import Link from 'next/link'
import Image from 'next/image'
import { MobileMenu } from './MobileMenu'
import { Navigation } from './Navigation'
import { HeaderAuth } from './HeaderAuth'

interface HeaderProps {
    // When false, the account slice is omitted entirely. Only needed for
    // surfaces that deliberately render no auth UI; everything else should
    // leave this alone.
    showAuth?: boolean
}

/**
 * Static header shell. It no longer reads cookies, so a page rendering
 * <Header /> is free to be statically generated — see HeaderAuth for why.
 */
export function Header({ showAuth = true }: HeaderProps = {}) {
    return (
        <header className="border-b bg-white dark:bg-gray-900 sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight">
                    <Image src="/logo.png" alt="Prodsnap" width={36} height={36} className="rounded-lg" priority />
                    <span>Prod<span className="text-violet-600">snap</span></span>
                </Link>

                <Navigation />

                {showAuth ? (
                    <HeaderAuth />
                ) : (
                    <div className="flex items-center gap-2">
                        <MobileMenu isLoggedIn={false} />
                    </div>
                )}
            </div>
        </header>
    )
}
