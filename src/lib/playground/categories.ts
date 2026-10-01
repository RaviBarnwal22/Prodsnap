/**
 * Playground categories. One per case type in the practice library; each maps
 * to the rubric the real grader uses for that type, so the skills drilled here
 * are exactly the ones a real case is scored on.
 */
export interface PlaygroundCategory {
    slug: string
    dbCategory: string
    title: string
    emoji: string
    tagline: string
    /** Tailwind gradient classes for the category card. */
    gradient: string
}

export const PLAYGROUND_CATEGORIES: PlaygroundCategory[] = [
    { slug: 'product-design', dbCategory: 'CONSUMER_PRODUCT_DESIGN', title: 'Product Design', emoji: '🎨', tagline: 'Design products people actually want', gradient: 'from-violet-500 to-fuchsia-500' },
    { slug: 'ai-product', dbCategory: 'AI_PRODUCT', title: 'AI Product', emoji: '🤖', tagline: 'Build with models that are sometimes wrong', gradient: 'from-indigo-500 to-cyan-500' },
    { slug: 'rca', dbCategory: 'RCA', title: 'Root Cause Analysis', emoji: '🔍', tagline: 'Find out why the metric fell', gradient: 'from-rose-500 to-orange-500' },
    { slug: 'metrics', dbCategory: 'METRICS', title: 'Metrics', emoji: '📊', tagline: 'Measure what actually matters', gradient: 'from-emerald-500 to-teal-500' },
    { slug: 'guesstimates', dbCategory: 'GUESTIMATES', title: 'Guesstimates', emoji: '🧮', tagline: 'Estimate anything with confidence', gradient: 'from-amber-500 to-yellow-500' },
    { slug: 'strategy', dbCategory: 'STRATEGY', title: 'Strategy', emoji: '♟️', tagline: 'Build, buy or partner, and why', gradient: 'from-slate-600 to-slate-400' },
    { slug: 'gtm', dbCategory: 'GTM', title: 'Go-To-Market', emoji: '🚀', tagline: 'Launch to the right people first', gradient: 'from-sky-500 to-blue-600' },
    { slug: 'growth', dbCategory: 'GROWTH_RETENTION', title: 'Growth & Retention', emoji: '📈', tagline: 'Get users back, again and again', gradient: 'from-lime-500 to-green-600' },
    { slug: 'tech', dbCategory: 'TECH_ACUMEN', title: 'Tech Acumen', emoji: '⚙️', tagline: 'Talk tech without being an engineer', gradient: 'from-zinc-600 to-neutral-500' },
    { slug: 'behavioral', dbCategory: 'BEHAVIORAL', title: 'Behavioral', emoji: '🗣️', tagline: 'Tell stories that prove you can lead', gradient: 'from-pink-500 to-rose-500' },
]

export function getPlaygroundCategory(slug: string): PlaygroundCategory | undefined {
    return PLAYGROUND_CATEGORIES.find(c => c.slug === slug)
}

/** Title-cased label for a rubric dimension key, e.g. user_segmentation. */
export function sectionTitle(key: string): string {
    const special: Record<string, string> = {
        discovery_and_framing: 'Clarifying Questions',
        north_star: 'North Star Metric',
        rca: 'RCA',
    }
    if (special[key]) return special[key]
    return key.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')
}
