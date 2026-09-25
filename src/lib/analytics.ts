import { prisma } from "@/lib/prisma"

/**
 * Server-side event logger for the funnel steps that cannot be derived from
 * pageviews.
 *
 * Most of the funnel is reconstructed from the `view` rows PageTracker already
 * writes, which is why it works on historical data. Only genuinely invisible
 * transitions belong here, so the event list stays short enough to trust.
 *
 * This lives outside `actions.ts` on purpose. Every export of a `'use server'`
 * module is a public HTTP endpoint, and an unauthenticated endpoint that writes
 * rows is an invitation to fill the table with noise. Callers are server code.
 *
 * Never throws. Losing an analytics row must never fail the user's actual action.
 */
/**
 * The funnel, in order. Each step is logged from SERVER code at the moment the
 * transition actually happens, so the numbers cannot be inflated by a client
 * that fires an event and then fails, or by anyone POSTing to an endpoint.
 *
 *   demo_started      visitor typed into the homepage demo (client-signalled,
 *                     via trackActivity — the only step with no server moment)
 *   demo_submitted    demo answer actually evaluated
 *   signup_completed  User row created for the first time
 *   practice_started  opened a real case and passed the quota check
 *   practice_submitted a real case was graded
 *   paywall_hit       blocked by the free limit
 *   checkout_started  a Cashfree order was created
 *   purchase_completed payment verified by Cashfree
 *
 * demo_started -> demo_submitted and paywall_hit -> checkout_started are the
 * two drop-offs that were previously invisible.
 */
export type AnalyticsEvent =
    | "demo_started"
    | "demo_submitted"
    | "signup_completed"
    | "practice_started"
    | "practice_submitted"
    | "paywall_hit"
    | "checkout_started"
    | "purchase_completed"

/** Ordered for funnel reporting. */
export const FUNNEL_STEPS: AnalyticsEvent[] = [
    "demo_started",
    "demo_submitted",
    "signup_completed",
    "practice_started",
    "practice_submitted",
    "paywall_hit",
    "checkout_started",
    "purchase_completed",
]

export async function logEvent(
    action: AnalyticsEvent,
    page: string,
    userId?: string | null,
    metadata?: string
): Promise<void> {
    try {
        await prisma.userActivity.create({
            data: {
                userId: userId || null,
                page: page.slice(0, 200),
                action,
                metadata: metadata ? metadata.slice(0, 500) : null,
            },
        })
    } catch (error) {
        console.error("[logEvent] Error:", error)
    }
}
