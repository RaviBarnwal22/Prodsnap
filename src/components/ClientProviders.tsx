'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { AuthProvider } from '@/components/AuthContext'

// AuthProvider wraps every page, so it MUST be server-rendered. Loading it with
// `ssr: false` put the whole app inside a BailoutToCSR boundary — Next then
// skipped server rendering for every route and crawlers received an empty
// shell with no <h1> and no content. It is pure React state (the modal it
// renders returns null while closed), so a static import is safe.
//
// These two render no visible markup and are not ancestors of `children`, so
// keeping them client-only costs nothing. Each sits in its own Suspense
// boundary so its CSR bailout stays contained instead of unmounting the page.
const SessionTimeout = dynamic(() => import('@/components/SessionTimeout'), { ssr: false })
const PageTracker = dynamic(() => import('@/components/PageTracker'), { ssr: false })

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Suspense fallback={null}>
                <SessionTimeout />
            </Suspense>
            <Suspense fallback={null}>
                <PageTracker />
            </Suspense>
            <AuthProvider>
                {children}
            </AuthProvider>
        </>
    )
}
