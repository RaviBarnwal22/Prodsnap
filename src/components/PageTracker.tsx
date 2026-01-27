'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackActivity } from '@/app/actions'

export default function PageTracker() {
    const pathname = usePathname()

    useEffect(() => {
        // Track the page view on mount and whenever pathname changes
        trackActivity(pathname, 'view')
    }, [pathname])

    return null
}
