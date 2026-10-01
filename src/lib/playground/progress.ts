'use client'

import type { PlaygroundProgress, SectionProgress } from './types'

/**
 * Progress lives in the browser for now. It never touches the database, which
 * keeps the Playground free to test locally. The cost is that progress does not
 * follow a user across devices; moving it server-side is the natural next step
 * once the feature proves it keeps people coming back.
 */
const KEY = 'prodsnap_playground_v1'

const empty = (): PlaygroundProgress => ({ xp: 0, categories: {} })

export function loadProgress(): PlaygroundProgress {
    try {
        const raw = localStorage.getItem(KEY)
        if (!raw) return empty()
        const parsed = JSON.parse(raw)
        return { xp: Number(parsed.xp) || 0, categories: parsed.categories || {} }
    } catch {
        return empty()
    }
}

export function saveProgress(p: PlaygroundProgress) {
    try {
        localStorage.setItem(KEY, JSON.stringify(p))
    } catch {
        // Private mode or storage blocked: the game still works, it just forgets.
    }
}

/** Stars from a score out of `total`. One star is the pass mark that unlocks the next section. */
export function starsFor(score: number, total: number): number {
    const pct = total ? score / total : 0
    if (pct >= 1) return 3
    if (pct >= 0.75) return 2
    if (pct >= 0.6) return 1
    return 0
}

export function recordSection(slug: string, sectionKey: string, score: number, total: number, xpEarned: number): PlaygroundProgress {
    const p = loadProgress()
    const cat = p.categories[slug] || {}
    const prev: SectionProgress = cat[sectionKey] || { best: 0, stars: 0 }
    const stars = starsFor(score, total)
    cat[sectionKey] = { best: Math.max(prev.best, score), stars: Math.max(prev.stars, stars) }
    p.categories[slug] = cat
    p.xp += xpEarned
    saveProgress(p)
    return p
}

export const MASTERY_STARS_PER_SECTION = 1
