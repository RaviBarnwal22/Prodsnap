// Subscription constants - can be used on both client and server
export const FREE_ATTEMPT_LIMIT = 5
export const SUBSCRIPTION_PRICE = 199

// Input bounds. Prisma String maps to Postgres `text`, so the database imposes no
// ceiling: unbounded free text is a DoS vector and, for anything reaching an AI
// prompt, a direct cost-abuse vector. Enforce these server-side, never in the UI only.
export const MAX_ANSWER_CHARS = 20000
export const MAX_MESSAGE_CHARS = 2000
export const MAX_NAME_CHARS = 120
export const MAX_EMAIL_CHARS = 254
export const MAX_URL_CHARS = 500

// Authoritative price list. The server resolves every charge and every bundled
// perk from this map; amounts sent by the client are never trusted.
// aiBonusMonths = months of Prodsnap AI access granted on successful payment.
export const MENTORSHIP_SERVICES = {
    "PM Career Accelerator": { priceINR: 1299, duration: "3 × 45 min", sessions: 3, aiBonusMonths: 1 },
    "Profile & Resume Booster": { priceINR: 899, duration: "2 × 45 min", sessions: 2, aiBonusMonths: 1 },
    "Resume Review": { priceINR: 499, duration: "45 min", sessions: 1, aiBonusMonths: 1 },
} as const

export type MentorshipServiceTitle = keyof typeof MENTORSHIP_SERVICES

export function getMentorshipPrice(serviceType: string): number | null {
    const service = MENTORSHIP_SERVICES[serviceType as MentorshipServiceTitle]
    return service ? service.priceINR : null
}

export function getMentorshipAiBonusMonths(serviceType: string): number {
    const service = MENTORSHIP_SERVICES[serviceType as MentorshipServiceTitle]
    return service ? service.aiBonusMonths : 0
}

export function formatPriceINR(amount: number): string {
    return `₹${amount.toLocaleString('en-IN')}`
}
