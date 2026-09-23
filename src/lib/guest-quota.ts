import { createHash } from 'crypto'
import { prisma } from '@/lib/prisma'
import { GUEST_DEMO_DAILY_LIMIT } from '@/lib/constants'

/**
 * Per-network daily quota for the signed-out homepage demo.
 *
 * Counted in the existing `UserActivity` table so this needs no schema change
 * against the production database.
 *
 * This is a cost guard, not a security control. `x-forwarded-for` can be spoofed
 * and a visitor can change networks, so treat it as "enough friction that
 * scripting the free AI is not worth it" rather than a hard boundary. The real
 * boundary is that nothing here creates an account, grants access, or touches
 * money.
 */

const DEMO_ACTION = 'guest_micro_case_demo'
const WINDOW_MS = 24 * 60 * 60 * 1000

/**
 * The raw address is never stored. A salted hash is enough to count repeat
 * visits while keeping the log free of personal data — and it is a one-way
 * function, so the table cannot be mined for who visited.
 */
function fingerprint(ip: string): string {
    const salt = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SMTP_PASSWORD || 'prodsnap'
    return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 40)
}

/** Reads the client address as seen by the proxy. */
export async function getClientFingerprint(): Promise<string> {
    const { headers } = await import('next/headers')
    const h = await headers()

    // x-forwarded-for is a comma-separated chain; the first entry is the client.
    const raw =
        h.get('x-vercel-forwarded-for') ||
        h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        h.get('x-real-ip') ||
        'unknown'

    return fingerprint(raw)
}

/** How many demo evaluations this network has used in the last 24 hours. */
export async function getGuestDemoUsage(fp: string): Promise<number> {
    return prisma.userActivity.count({
        where: {
            action: DEMO_ACTION,
            ipAddress: fp,
            createdAt: { gte: new Date(Date.now() - WINDOW_MS) },
        },
    })
}

/**
 * Records one consumed evaluation. Logged only after the AI actually answered,
 * so a failed or errored attempt does not burn the visitor's quota.
 */
export async function recordGuestDemoUse(fp: string): Promise<void> {
    try {
        await prisma.userActivity.create({
            data: {
                userId: null,
                page: '/',
                action: DEMO_ACTION,
                ipAddress: fp,
            },
        })
    } catch (e) {
        // Never fail the user's evaluation because the counter could not be
        // written; the worst case is they get one extra free try.
        console.error('[guest-quota] failed to record demo use:', e)
    }
}

export { GUEST_DEMO_DAILY_LIMIT }
