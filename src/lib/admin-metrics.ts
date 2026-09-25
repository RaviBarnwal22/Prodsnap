import { prisma } from "@/lib/prisma"
import { FUNNEL_STEPS } from "@/lib/analytics"

/**
 * Metrics for the admin dashboard.
 *
 * The previous dashboard counted totals since launch, which only ever go up and
 * so cannot answer the one question worth asking: is this week better than last.
 * Worse, every number included the founder's own account, which is 51 of the 69
 * practice submissions on record. "Total Submissions: 69" actually meant 18.
 *
 * Everything here excludes the accounts below and is reported over a window.
 */

// Founder and known test accounts. Their activity is real usage of the product
// but it is not evidence that anyone else finds it useful, so it is kept out of
// every number rather than silently inflating all of them.
export const EXCLUDED_EMAILS = [
    "ravibarnwal89@gmail.com",
    "ravibarnwal22@gmail.com",
    "shwetasahani17@gmail.com",
]

const EXCLUDED_PATTERNS = ["@example.com", "test@", "sandbox", "+test"]

async function getExcludedUserIds(): Promise<string[]> {
    const users = await prisma.user.findMany({
        where: {
            OR: [
                { email: { in: EXCLUDED_EMAILS } },
                ...EXCLUDED_PATTERNS.map((p) => ({ email: { contains: p, mode: "insensitive" as const } })),
            ],
        },
        select: { id: true },
    })
    return users.map((u) => u.id)
}

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000)

function pct(part: number, whole: number): number | null {
    if (!whole) return null
    return Math.round((part / whole) * 1000) / 10
}

function percentile(sorted: number[], p: number): number {
    if (!sorted.length) return 0
    const i = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))
    return sorted[i]
}

export interface FunnelStep {
    label: string
    count: number
    /** Conversion from the previous step, null for the first step. */
    fromPrev: number | null
}

export interface WindowMetrics {
    days: number
    funnel: FunnelStep[]
    /**
     * Second funnel, built from explicitly logged events rather than pageviews.
     *
     * The pageview funnel above works on historical data, which is why it exists
     * and why it stays. But three transitions have no pageview at all and were
     * therefore invisible: starting the demo versus submitting it, hitting the
     * paywall versus opening checkout, and opening checkout versus paying.
     *
     * These only have data from the day the events were added, so early numbers
     * are sparse. That is expected, not a bug.
     */
    eventFunnel: FunnelStep[]
    signups: number
    activated: number
    activationRate: number | null
    submissions: number
    activeSubmitters: number
}

/** Human labels for the logged funnel events, in funnel order. */
const EVENT_LABELS: Record<string, string> = {
    demo_started: "Started the demo",
    demo_submitted: "Submitted the demo",
    signup_completed: "Signed up",
    practice_started: "Opened a real case",
    practice_submitted: "Graded a real case",
    paywall_hit: "Hit the paywall",
    checkout_started: "Opened checkout",
    purchase_completed: "Paid",
}

/**
 * Counts each logged funnel event in the window, excluding internal accounts the
 * same way every other number here does.
 *
 * Deliberately NOT a strict per-user funnel: these are event counts, so a step
 * can exceed the one above it (someone can hit the paywall repeatedly). It
 * answers "where does volume fall away", not "did this exact person progress".
 */
async function eventFunnel(days: number, excludedIds: string[]): Promise<FunnelStep[]> {
    const since = daysAgo(days)
    const notExcluded = { OR: [{ userId: null }, { userId: { notIn: excludedIds } }] }

    const rows = await prisma.userActivity.groupBy({
        by: ["action"],
        where: {
            createdAt: { gte: since },
            action: { in: FUNNEL_STEPS as string[] },
            ...notExcluded,
        },
        _count: { action: true },
    })

    const counts = new Map(rows.map(r => [r.action, r._count.action]))

    let previous: number | null = null
    return FUNNEL_STEPS.map(step => {
        const count = counts.get(step) ?? 0
        const fromPrev = previous === null ? null : pct(count, previous)
        previous = count
        return { label: EVENT_LABELS[step] ?? step, count, fromPrev }
    })
}

/**
 * The funnel is derived from pageviews the PageTracker already records, so it
 * works on historical data rather than only from the day tracking is added.
 * A case view is any view of /practice/<id>, which is the step where people
 * actually drop: they open a case and never answer it.
 */
async function windowMetrics(days: number, excludedIds: string[]): Promise<WindowMetrics> {
    const since = daysAgo(days)
    const notExcluded = { OR: [{ userId: null }, { userId: { notIn: excludedIds } }] }

    const [visitorRows, listViews, caseViews, submissions, signups] = await Promise.all([
        prisma.userActivity.findMany({
            where: { createdAt: { gte: since }, action: "view", ...notExcluded },
            select: { userId: true, ipAddress: true },
        }),
        prisma.userActivity.count({
            where: { createdAt: { gte: since }, action: "view", page: "/practice", ...notExcluded },
        }),
        prisma.userActivity.findMany({
            where: { createdAt: { gte: since }, action: "view", page: { startsWith: "/practice/" }, ...notExcluded },
            select: { userId: true, ipAddress: true },
        }),
        prisma.practiceSubmission.findMany({
            where: { createdAt: { gte: since }, userId: { notIn: excludedIds } },
            select: { userId: true },
        }),
        prisma.user.count({ where: { createdAt: { gte: since }, id: { notIn: excludedIds } } }),
    ])

    const uniq = (rows: { userId: string | null; ipAddress: string | null }[]) =>
        new Set(rows.map((r) => r.userId ?? r.ipAddress ?? "unknown")).size

    const visitors = uniq(visitorRows)
    const caseOpeners = uniq(caseViews)
    const submitters = new Set(submissions.map((s) => s.userId)).size

    // Of the people who signed up in this window, how many ever submitted?
    const newUsers = await prisma.user.findMany({
        where: { createdAt: { gte: since }, id: { notIn: excludedIds } },
        select: { id: true },
    })
    const activatedRows = newUsers.length
        ? await prisma.practiceSubmission.groupBy({
              by: ["userId"],
              where: { userId: { in: newUsers.map((u) => u.id) } },
          })
        : []

    const funnel: FunnelStep[] = [
        { label: "Visitors", count: visitors, fromPrev: null },
        { label: "Viewed case list", count: listViews, fromPrev: pct(listViews, visitors) },
        { label: "Opened a case", count: caseOpeners, fromPrev: pct(caseOpeners, listViews) },
        { label: "Submitted an answer", count: submitters, fromPrev: pct(submitters, caseOpeners) },
    ]

    return {
        days,
        funnel,
        eventFunnel: await eventFunnel(days, excludedIds),
        signups,
        activated: activatedRows.length,
        activationRate: pct(activatedRows.length, signups),
        submissions: submissions.length,
        activeSubmitters: submitters,
    }
}

export interface RetentionMetrics {
    totalUsers: number
    everSubmitted: number
    everSubmittedRate: number | null
    submittedTwicePlus: number
    repeatRate: number | null
    medianDaysToFirst: number | null
}

async function retentionMetrics(excludedIds: string[]): Promise<RetentionMetrics> {
    const [totalUsers, grouped] = await Promise.all([
        prisma.user.count({ where: { id: { notIn: excludedIds } } }),
        prisma.practiceSubmission.groupBy({
            by: ["userId"],
            where: { userId: { notIn: excludedIds } },
            _count: { _all: true },
            _min: { createdAt: true },
        }),
    ])

    const everSubmitted = grouped.length
    const submittedTwicePlus = grouped.filter((g) => g._count._all >= 2).length

    // Median days from signup to first submission, for people who got that far.
    const users = await prisma.user.findMany({
        where: { id: { in: grouped.map((g) => g.userId) } },
        select: { id: true, createdAt: true },
    })
    const signupById = new Map(users.map((u) => [u.id, u.createdAt]))
    const gaps = grouped
        .map((g) => {
            const signup = signupById.get(g.userId)
            const first = g._min.createdAt
            if (!signup || !first) return null
            return Math.max(0, (first.getTime() - signup.getTime()) / 86_400_000)
        })
        .filter((x): x is number => x !== null)
        .sort((a, b) => a - b)

    return {
        totalUsers,
        everSubmitted,
        everSubmittedRate: pct(everSubmitted, totalUsers),
        submittedTwicePlus,
        repeatRate: pct(submittedTwicePlus, everSubmitted),
        medianDaysToFirst: gaps.length ? Math.round(percentile(gaps, 50) * 10) / 10 : null,
    }
}

export interface HealthMetrics {
    ai: { provider: string; success: number; error: number; successRate: number | null; p50: number; p95: number }[]
    email: { sent: number; failed: number; rate: number | null }
    bookings: { pending: number; confirmed: number; completed: number; stalePending: number }
    activeSubscriptions: number
    demoRuns: number
}

async function healthMetrics(): Promise<HealthMetrics> {
    const since = daysAgo(30)

    const [logs, emailOk, emailBad, bookingGroups, staleP, activeSubs, demoRuns] = await Promise.all([
        prisma.apiUsageLog.findMany({
            where: { createdAt: { gte: since } },
            select: { provider: true, status: true, responseTime: true },
        }),
        prisma.emailLog.count({ where: { createdAt: { gte: since }, status: "success" } }),
        prisma.emailLog.count({ where: { createdAt: { gte: since }, status: { not: "success" } } }),
        prisma.mentorshipBooking.groupBy({ by: ["status"], _count: { _all: true } }),
        prisma.mentorshipBooking.count({
            where: { status: "pending", createdAt: { lt: daysAgo(2) } },
        }),
        prisma.subscription.count({ where: { status: "active" } }),
        prisma.userActivity.count({
            where: { createdAt: { gte: since }, action: "demo_submitted" },
        }),
    ])

    const byProvider = new Map<string, { success: number; error: number; times: number[] }>()
    for (const l of logs) {
        const e = byProvider.get(l.provider) ?? { success: 0, error: 0, times: [] }
        if (l.status === "success") {
            e.success++
            if (l.responseTime) e.times.push(l.responseTime)
        } else e.error++
        byProvider.set(l.provider, e)
    }

    const statusCount = (s: string) =>
        bookingGroups.find((b) => b.status === s)?._count._all ?? 0

    return {
        ai: [...byProvider.entries()].map(([provider, v]) => {
            const sorted = v.times.sort((a, b) => a - b)
            return {
                provider,
                success: v.success,
                error: v.error,
                successRate: pct(v.success, v.success + v.error),
                p50: percentile(sorted, 50),
                p95: percentile(sorted, 95),
            }
        }),
        email: { sent: emailOk, failed: emailBad, rate: pct(emailOk, emailOk + emailBad) },
        bookings: {
            pending: statusCount("pending"),
            confirmed: statusCount("confirmed"),
            completed: statusCount("completed"),
            stalePending: staleP,
        },
        activeSubscriptions: activeSubs,
        demoRuns,
    }
}

export interface AdminMetrics {
    week: WindowMetrics
    month: WindowMetrics
    retention: RetentionMetrics
    health: HealthMetrics
    excludedAccounts: number
    generatedAt: Date
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
    const excludedIds = await getExcludedUserIds()
    const [week, month, retention, health] = await Promise.all([
        windowMetrics(7, excludedIds),
        windowMetrics(30, excludedIds),
        retentionMetrics(excludedIds),
        healthMetrics(),
    ])
    return {
        week,
        month,
        retention,
        health,
        excludedAccounts: excludedIds.length,
        generatedAt: new Date(),
    }
}
