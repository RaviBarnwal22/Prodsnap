import type { PlaygroundCategoryData } from './types'
import { getRubricKeys } from '@/lib/ai/rubrics'
import { getPlaygroundCategory } from './categories'

// Static imports rather than a runtime fs read: the JSON is bundled with the
// route, so it works the same on Vercel's serverless runtime as it does locally.
import productDesign from '@/data/playground/product-design.json'
import aiProduct from '@/data/playground/ai-product.json'
import rca from '@/data/playground/rca.json'
import metrics from '@/data/playground/metrics.json'
import guesstimates from '@/data/playground/guesstimates.json'
import strategy from '@/data/playground/strategy.json'
import gtm from '@/data/playground/gtm.json'
import growth from '@/data/playground/growth.json'
import tech from '@/data/playground/tech.json'
import behavioral from '@/data/playground/behavioral.json'

const DATA: Record<string, PlaygroundCategoryData> = {
    'product-design': productDesign as PlaygroundCategoryData,
    'ai-product': aiProduct as PlaygroundCategoryData,
    rca: rca as PlaygroundCategoryData,
    metrics: metrics as PlaygroundCategoryData,
    guesstimates: guesstimates as PlaygroundCategoryData,
    strategy: strategy as PlaygroundCategoryData,
    gtm: gtm as PlaygroundCategoryData,
    growth: growth as PlaygroundCategoryData,
    tech: tech as PlaygroundCategoryData,
    behavioral: behavioral as PlaygroundCategoryData,
}

export function getCategoryData(slug: string): PlaygroundCategoryData | undefined {
    return DATA[slug]
}

/**
 * Sections in interview order, i.e. the rubric's dimension order, keeping only
 * sections that actually have content. A section that failed generation is
 * skipped rather than rendered empty.
 */
export function getSectionOrder(slug: string): string[] {
    const cat = getPlaygroundCategory(slug)
    const data = DATA[slug]
    if (!cat || !data) return []
    return getRubricKeys(cat.dbCategory).filter(k => data.sections[k]?.questions?.length)
}

export function getQuestionCount(slug: string): number {
    const data = DATA[slug]
    if (!data) return 0
    return Object.values(data.sections).reduce((n, s) => n + (s.questions?.length || 0), 0)
}
