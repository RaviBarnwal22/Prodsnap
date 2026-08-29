'use client'

import dynamic from 'next/dynamic'

// These are all client-only — lazy-loaded so they don't inflate the initial JS bundle
const AuthProvider = dynamic(() => import('@/components/AuthContext').then(m => ({ default: m.AuthProvider })), { ssr: false })
const SessionTimeout = dynamic(() => import('@/components/SessionTimeout'), { ssr: false })
const PageTracker = dynamic(() => import('@/components/PageTracker'), { ssr: false })

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <>
            <SessionTimeout />
            <PageTracker />
            <AuthProvider>
                {children}
            </AuthProvider>
        </>
    )
}
