import { SUBSCRIPTION_PRICE } from "@/lib/constants"

// Call-to-action blocks the author drops into an article. Stored in the HTML
// as <div data-cta="<type>"></div> and rendered as a component, so the copy
// and links live here, not in every article. Changing a CTA here updates it
// in every article at once.
export const BLOG_CTAS = {
    practice: {
        label: "Free AI PM case",
        eyebrow: "Practice what you just read",
        title: "Answer a real AI PM case and get scored in seconds",
        body: "Our AI interviewer grades your answer on six dimensions and shows a model answer. Your first case in every track is free.",
        button: "Try a free case",
        href: "/practice?category=AI_PRODUCT",
    },
    playground: {
        label: "Playground drills",
        eyebrow: "Two-minute warm-up",
        title: "Sharpen one PM skill at a time",
        body: "Quick multiple-choice drills on metrics, RCA, strategy and AI products. Free, no sign-up needed.",
        button: "Open the Playground",
        href: "/playground",
    },
    subscription: {
        label: "Prodsnap subscription",
        eyebrow: "Go unlimited",
        title: `Unlimited AI-graded PM cases for ₹${SUBSCRIPTION_PRICE} a month`,
        body: "Over 200 cases across product sense, metrics, strategy and AI product management, each with instant feedback.",
        button: "Start practicing",
        href: "/practice",
    },
    mentorship: {
        label: "1:1 mentorship",
        eyebrow: "Work with a mentor",
        title: "Get a PM interview plan built around you",
        body: "Mock interviews, resume review and a roadmap from a working product manager. Every package includes a free month of Prodsnap.",
        button: "See mentorship packages",
        href: "/mentorship#book",
    },
} as const

export type BlogCtaType = keyof typeof BLOG_CTAS

export const BLOG_CTA_TYPES = Object.keys(BLOG_CTAS) as BlogCtaType[]

export function isBlogCtaType(value: unknown): value is BlogCtaType {
    return typeof value === "string" && Object.hasOwn(BLOG_CTAS, value)
}
