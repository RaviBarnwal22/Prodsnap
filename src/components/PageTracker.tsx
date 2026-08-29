'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackActivity } from '@/app/actions'

export default function PageTracker() {
    const pathname = usePathname()

    useEffect(() => {
        // Defer tracking by 2s so it never competes with critical page interactions
        const timer = setTimeout(() => {
            trackActivity(pathname, 'view')
        }, 2000)
        return () => clearTimeout(timer)
    }, [pathname])

    return null
}
