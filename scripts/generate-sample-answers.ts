/**
 * Generates a model answer for every practice question.
 *
 * Writes to a JSON file, NOT to the database. A separate script does the write,
 * so the output can be reviewed before it touches production.
 *
 * The prompt alone does not reliably produce the house style: in testing the
 * model emitted em dashes it had been told to avoid and overran the word count
 * every time. So every answer is validated mechanically and regenerated on
 * failure, and the few faults that are safe to repair (em dashes, smart quotes)
 * are repaired rather than retried.
 *
 *   npx tsx scripts/generate-sample-answers.ts            all questions
 *   npx tsx scripts/generate-sample-answers.ts --limit 5  a sample for review
 *   npx tsx scripts/generate-sample-answers.ts --only-missing
 */
import dotenv from 'dotenv'
import { writeFileSync, existsSync, readFileSync } from 'fs'
import { prisma } from '../src/lib/prisma'
import { getRubric } from '../src/lib/ai/rubrics'
import { GEMINI_MODEL_CHAIN } from '../src/lib/constants'

dotenv.config()

const OUT = 'scripts/generated-sample-answers.json'
const MIN_WORDS = 260
const MAX_WORDS = 400
const MAX_ATTEMPTS = 3

// Phrases that mark text as machine written. Checked case insensitively.
const AI_TELLS = [
    'delve', 'leverage', 'robust', 'seamless', 'furthermore', 'moreover',
    'firstly', 'secondly', 'in conclusion', 'it is important to note',
    'landscape', 'tapestry', 'testament', 'crucial to', 'a wide range of',
    'plays a vital role', 'it is worth noting', 'comprehensive understanding',
    'clear understanding of the situation', 'i would begin by establishing',
    'dive deep', 'unpack', 'holistic', 'synergy', 'utilize', 'myriad',
]

const BRANDS = [
    'Netflix', 'Zomato', 'Swiggy', 'Spotify', 'Uber', 'Ola', 'WhatsApp', 'Instagram',
    'Amazon', 'Flipkart', 'Paytm', 'PhonePe', 'YouTube', 'Airbnb', 'LinkedIn', 'Zoom',
    'Slack', 'Duolingo', 'Starbucks', 'Google', 'Meta', 'Myntra', 'Nykaa', 'Cred',
    'Dunzo', 'Zepto', 'Blinkit', 'Rapido', 'BookMyShow', 'Hotstar', 'Razorpay',
]

function buildPrompt(title: string, description: string, category: string, retryNote = '') {
    const rubric = getRubric(category)
    const dims = rubric.dimensions.map(d => `${d.key}: ${d.guidance}`).join('\n')

    return `You are a product manager who has just answered this question well in a real interview. Write down what you said.

QUESTION: ${title}
BRIEF: ${description}
CASE TYPE: ${category}

A strong answer to this type of case covers ${rubric.framework}:
${dims}

HOW TO WRITE IT

Talk like a person thinking out loud, not like a document. Short sentences next to longer ones. Start with the actual substance, never with a wind up like "I would begin by establishing a clear understanding of".

Be specific to the point of being checkable. Name the segment. Give the number. If you estimate, show the arithmetic in words. Vague is the only real failure.

Commit to things. Say which option you picked and what you gave up. Name one thing you would deliberately NOT do, and why, in a single sentence somewhere in the middle, not as a closing flourish.

Admit one genuine uncertainty, the way a real candidate does. Something like not knowing the current conversion rate and saying what you would check.

HARD CONSTRAINTS

Write about the exact company, product and market in the question. Never substitute a different company.
${MIN_WORDS} to ${MAX_WORDS} words. Count them.
Four or five paragraphs of continuous prose.
No asterisks. No bullets. No numbered lists. No headings. No labels like "Goal:" or "Step 1". No line may start with a dash.
Never use an em dash or an en dash. Ordinary hyphens inside words like middle-income are fine.
Never use these words: ${AI_TELLS.slice(0, 14).join(', ')}.
First person throughout.
${retryNote}
Return only the answer. No preamble, no title, no sign off.`
}

async function callGemini(prompt: string): Promise<string> {
    let lastErr = 'unknown'
    for (const model of GEMINI_MODEL_CHAIN) {
        try {
            const r = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ role: 'user', parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.85 },
                    }),
                }
            )
            const j: any = await r.json()
            if (!r.ok) { lastErr = j?.error?.message || `HTTP ${r.status}`; continue }
            const text = j?.candidates?.[0]?.content?.parts?.[0]?.text
            if (text) return String(text).trim()
        } catch (e: any) { lastErr = e.message }
    }
    throw new Error(lastErr)
}

/** Faults safe to fix without paying for another generation. */
function repair(text: string): string {
    return text
        .replace(/[—–]/g, ', ')     // em / en dash to a comma
        .replace(/[‘’]/g, "'")      // smart quotes
        .replace(/[“”]/g, '"')
        .replace(/[*•▪]/g, '')
        .replace(/^\s*[-–—]\s*/gm, '')        // leading list dashes
        .replace(/\n{3,}/g, '\n\n')
        .replace(/ {2,}/g, ' ')
        .replace(/ ,/g, ',')
        .trim()
}

interface Check { ok: boolean; problems: string[]; words: number }

function validate(text: string, title: string, description: string): Check {
    const problems: string[] = []
    const words = text.split(/\s+/).filter(Boolean).length
    const lower = text.toLowerCase()

    if (words < MIN_WORDS) problems.push(`too short (${words})`)
    if (words > MAX_WORDS) problems.push(`too long (${words})`)
    if (/[*•▪]/.test(text)) problems.push('bullet or asterisk')
    if (/[—–]/.test(text)) problems.push('em or en dash')
    if (/^\s*[-–—]/m.test(text)) problems.push('line starts with dash')
    if (/^\s*(#{1,6}\s|\d+\.\s|Step \d|Goal:|Summary:)/m.test(text)) problems.push('heading or list')

    const tells = AI_TELLS.filter(w => lower.includes(w))
    if (tells.length) problems.push(`ai tells: ${tells.join(', ')}`)

    // The answer must be about the company the question names.
    const qText = `${title} ${description}`
    const qBrands = BRANDS.filter(b => qText.toLowerCase().includes(b.toLowerCase()))
    if (qBrands.length) {
        const mentioned = qBrands.filter(b => lower.includes(b.toLowerCase()))
        if (!mentioned.length) problems.push(`never mentions ${qBrands.join('/')}`)
        const foreign = BRANDS.filter(b =>
            !qBrands.includes(b) && lower.includes(b.toLowerCase())
        )
        if (foreign.length > 1) problems.push(`drifts to ${foreign.join(', ')}`)
    }

    return { ok: problems.length === 0, problems, words }
}

async function main() {
    const args = process.argv.slice(2)
    const limitArg = args.indexOf('--limit')
    const limit = limitArg >= 0 ? parseInt(args[limitArg + 1], 10) : undefined
    const onlyMissing = args.includes('--only-missing')

    const questions = await prisma.practiceQuestion.findMany({
        where: onlyMissing ? { OR: [{ solutionText: null }, { solutionText: '' }] } : {},
        select: { id: true, title: true, description: true, category: true },
        orderBy: { category: 'asc' },
        ...(limit ? { take: limit } : {}),
    })

    const done: Record<string, any> = existsSync(OUT)
        ? JSON.parse(readFileSync(OUT, 'utf8'))
        : {}

    console.log(`${questions.length} questions, ${Object.keys(done).length} already generated\n`)

    let generated = 0, failed = 0
    for (const [i, q] of questions.entries()) {
        if (done[q.id]) continue

        let best: { text: string; check: Check } | null = null

        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            const note = best
                ? `\nA previous attempt was rejected for: ${best.check.problems.join('; ')}. Fix exactly that.`
                : ''
            try {
                const raw = await callGemini(buildPrompt(q.title, q.description, q.category, note))
                const text = repair(raw)
                const check = validate(text, q.title, q.description)
                if (!best || check.problems.length < best.check.problems.length) best = { text, check }
                if (check.ok) break
            } catch (e: any) {
                console.error(`  [${q.id}] attempt ${attempt} error: ${e.message}`)
            }
            await new Promise(r => setTimeout(r, 700))
        }

        if (best?.check.ok) {
            generated++
            done[q.id] = { ...q, answer: best.text, words: best.check.words }
        } else if (best) {
            failed++
            done[q.id] = { ...q, answer: best.text, words: best.check.words, problems: best.check.problems }
        }

        writeFileSync(OUT, JSON.stringify(done, null, 2))
        const status = best?.check.ok ? 'ok  ' : 'WARN'
        console.log(`${String(i + 1).padStart(3)}/${questions.length} ${status} [${q.category.padEnd(24)}] ${String(best?.check.words ?? 0).padStart(3)}w  ${q.title.slice(0, 48)}${best?.check.ok ? '' : '  <- ' + best?.check.problems.join('; ')}`)
        await new Promise(r => setTimeout(r, 400))
    }

    console.log(`\nclean: ${generated}   with warnings: ${failed}   file: ${OUT}`)
    console.log('Nothing written to the database.')
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1) }).finally(() => prisma.$disconnect())
