// Subscription constants - can be used on both client and server
export const FREE_ATTEMPT_LIMIT = 5
export const SUBSCRIPTION_PRICE = 199

// Homepage live demo: how many AI evaluations a signed-out visitor gets per day,
// counted per network address rather than per account. Enough to prove the
// product works, small enough that scripting it is pointless.
export const GUEST_DEMO_DAILY_LIMIT = 3

// Input bounds. Prisma String maps to Postgres `text`, so the database imposes no
// ceiling: unbounded free text is a DoS vector and, for anything reaching an AI
// prompt, a direct cost-abuse vector. Enforce these server-side, never in the UI only.
// Gemini models to try in order, first success wins. gemini-1.5-flash and
// gemini-1.5-flash-latest were RETIRED by Google and now 404 — they sat here as
// "fallbacks" that could never fire. Verify any addition against
// GET https://generativelanguage.googleapis.com/v1beta/models before adding it.
// If every entry fails, the AI engine falls through to Groq.
export const GEMINI_MODEL_CHAIN = [
    "gemini-2.5-flash",        // primary
    "gemini-flash-lite-latest", // verified live on this key
    "gemini-3-flash-preview",   // verified live on this key
]

// Groq models to try in order. NOTE: llama-3.3-70b-versatile was hardcoded here
// previously and is NOT available on our account, so the "Groq fallback" could
// never have worked even once a key was set. Verify with
// GET https://api.groq.com/openai/v1/models before changing this.
// Ordered fast-but-good first: Groq exists to keep the homepage demo snappy,
// and the larger model is the quality backstop behind it.
export const GROQ_MODEL_CHAIN = [
    "openai/gpt-oss-20b",   // ~2.6s, valid JSON
    "openai/gpt-oss-120b",  // ~4.6s, strongest
    "qwen/qwen3.8-27b",     // ~1.8s, last resort
]

// Interviewer Hub: open to signed-out visitors, so the bounds do the work auth
// used to. A clarifying question is one short sentence; the transcript cap matters
// just as much, since history is client-supplied and drives the real prompt cost.
export const MAX_CLARIFYING_QUESTION_CHARS = 100
export const MAX_CLARIFYING_HISTORY_TURNS = 12
export const GUEST_INTERVIEWER_DAILY_LIMIT = 5

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

// serviceType arrives from the request body. A plain index would also match
// names inherited from Object.prototype ("toString", "constructor"), returning
// a function whose priceINR is undefined, which slipped past the null check in
// the order route. Only the catalog's own keys count.
function lookupService(serviceType: string) {
    return Object.hasOwn(MENTORSHIP_SERVICES, serviceType)
        ? MENTORSHIP_SERVICES[serviceType as MentorshipServiceTitle]
        : null
}

export function getMentorshipPrice(serviceType: string): number | null {
    return lookupService(serviceType)?.priceINR ?? null
}

export function getMentorshipAiBonusMonths(serviceType: string): number {
    return lookupService(serviceType)?.aiBonusMonths ?? 0
}

export function formatPriceINR(amount: number): string {
    return `₹${amount.toLocaleString('en-IN')}`
}
