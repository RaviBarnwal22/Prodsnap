// Subscription constants - can be used on both client and server
export const FREE_ATTEMPT_LIMIT = 5
export const SUBSCRIPTION_PRICE = 199

// Authoritative price list. The server resolves every charge from this map;
// amounts sent by the client are never trusted.
export const MENTORSHIP_SERVICES = {
    "1:1 Mock Interview": { priceINR: 1299, duration: "45 min" },
    "Resume Review": { priceINR: 499, duration: "45 min" },
    "Career Strategy": { priceINR: 999, duration: "45 min" },
    // TEMPORARY — ₹1 package for verifying live payments in production.
    // Remove this entry together with the demo card in MentorshipClient.tsx.
    "Demo Package (Testing)": { priceINR: 1, duration: "5 min" },
} as const

// TEMPORARY — delete alongside the demo entry above.
export const DEMO_SERVICE_TITLE = "Demo Package (Testing)"

export type MentorshipServiceTitle = keyof typeof MENTORSHIP_SERVICES

export function getMentorshipPrice(serviceType: string): number | null {
    const service = MENTORSHIP_SERVICES[serviceType as MentorshipServiceTitle]
    return service ? service.priceINR : null
}

export function formatPriceINR(amount: number): string {
    return `₹${amount.toLocaleString('en-IN')}`
}
