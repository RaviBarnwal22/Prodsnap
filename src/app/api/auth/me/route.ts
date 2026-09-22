import { NextResponse } from 'next/server'
import { getUser, isAdmin } from '@/lib/auth'

// Session summary for the header, which renders client-side so that content
// pages can be statically generated. Returns only what the header draws —
// no id, no email, no role — per the "return the minimum" rule.
export const dynamic = 'force-dynamic'

export async function GET() {
    const user = await getUser()

    if (!user) {
        return NextResponse.json(
            { authenticated: false },
            { headers: { 'Cache-Control': 'no-store, private' } }
        )
    }

    const displayName =
        user.firstName || user.name?.split(' ')[0] || user.email.split('@')[0]

    return NextResponse.json(
        {
            authenticated: true,
            displayName,
            menuName: user.firstName || user.name || user.email,
            isAdmin: isAdmin(user),
        },
        { headers: { 'Cache-Control': 'no-store, private' } }
    )
}
