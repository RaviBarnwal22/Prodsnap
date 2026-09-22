import { prisma } from '@/lib/prisma'

/**
 * Data access for the signed-in user's own account area.
 *
 * Every function here takes the resolved user from `getUser()` and scopes its
 * query to that user. Nothing takes an id from the caller, so a page cannot
 * accidentally render someone else's records.
 */

/**
 * `MentorshipBooking.userId` is a nullable loose column with no Prisma relation,
 * and 4 of the 23 live bookings have it set to null — those customers would see
 * an empty orders page if we matched on userId alone.
 *
 * The email on a booking is user-editable, so it is deliberately NOT trusted on
 * its own: it is only used to rescue rows that carry no userId at all. A row
 * that already belongs to another account can never be picked up this way.
 */
export async function getMyOrders(user: { id: string; email: string }) {
    return prisma.mentorshipBooking.findMany({
        where: {
            OR: [
                { userId: user.id },
                { AND: [{ userId: null }, { email: user.email }] },
            ],
        },
        orderBy: { createdAt: 'desc' },
        // Only what the page renders. adminNotes, paymentProof, reviewedBy and
        // reviewedAt are internal and never leave the server.
        select: {
            id: true,
            serviceType: true,
            amount: true,
            status: true,
            createdAt: true,
            scheduledAt: true,
            meetingLink: true,
            completedAt: true,
        },
        take: 50,
    })
}

export async function getMySubscription(user: { id: string }) {
    return prisma.subscription.findUnique({
        where: { userId: user.id },
        select: {
            status: true,
            planType: true,
            priceINR: true,
            startDate: true,
            endDate: true,
        },
    })
}

/** A subscription row can exist while being expired or inactive. */
export function isSubscriptionActive(sub: { status: string; endDate: Date | null } | null) {
    if (!sub) return false
    if (sub.status !== 'active') return false
    return !sub.endDate || sub.endDate.getTime() > Date.now()
}
