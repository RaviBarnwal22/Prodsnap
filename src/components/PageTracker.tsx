'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackActivity } from '@/app/actions'

// Where the visit came from, so the admin can count readers from LinkedIn.
// Read from window rather than useSearchParams, which would force every page
// to render on the client. "linkedin" when tagged or referred by LinkedIn,
// otherwise the utm_source or external referrer host, else nothing.
function trafficSource(): string | undefined {
    try {
        const utm = new URLSearchParams(window.location.search).get('utm_source')?.toLowerCase().slice(0, 40)
        const ref = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : ''
        if (utm === 'linkedin' || /(^|\.)(linkedin\.com|lnkd\.in)$/.test(ref)) return 'linkedin'
        if (utm) return utm
        if (ref && ref !== window.location.hostname.replace(/^www\./, '')) return ref.slice(0, 60)
    } catch { }
    return undefined
}

export default function PageTracker() {
    const pathname = usePathname()

    useEffect(() => {
        // Defer tracking by 2s so it never competes with critical page interactions
        const timer = setTimeout(() => {
            trackActivity(pathname, 'view', trafficSource())
        }, 2000)
        return () => clearTimeout(timer)
    }, [pathname])

    return null
}
