/**
 * Builds the Playground question bank.
 *
 * One file per category in src/data/playground/. Each category has one section
 * per rubric dimension (the same dimensions the real grader scores), and each
 * section draws its questions from ALL cases in that category plus a couple of
 * outside cases, so a section drills one skill across many situations.
 *
 * Output is static JSON committed with the code. Nothing is written to the
 * database, which is production.
 *
 *   npx tsx scripts/generate-playground.ts                 everything missing
 *   npx tsx scripts/generate-playground.ts --only rca      one category
 *   npx tsx scripts/generate-playground.ts --force         regenerate all
 */
import dotenv from 'dotenv'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { prisma } from '../src/lib/prisma'
import { getRubric } from '../src/lib/ai/rubrics'
import { GEMINI_MODEL_CHAIN } from '../src/lib/constants'
import { PLAYGROUND_CATEGORIES } from '../src/lib/playground/categories'

dotenv.config()

const OUT_DIR = 'src/data/playground'
const QUESTIONS_PER_SECTION = 8

function clean(s: unknown): string {
    return String(s ?? '')
        .replace(/[—–]/g, ', ')
        .replace(/[‘’]/g, "'")
        .replace(/[“”]/g, '"')
        .replace(/\*+/g, '')
        .replace(/ ,/g, ',')
        .replace(/ {2,}/g, ' ')
        .trim()
}

function buildPrompt(categoryTitle: string, framework: string, section: { key: string; guidance: string }, cases: { title: string; excerpt: string }[], retryNote = '') {
    const caseList = cases.map((c, i) => `${i + 1}. ${c.title}\n   Model answer excerpt: ${c.excerpt}`).join('\n')
    return `You are designing a learning game that teaches product managers how to crack ${categoryTitle} interview cases, using the ${framework} approach.

This section teaches ONE skill: ${section.key.replace(/_/g, ' ')}.
What good looks like: ${section.guidance}

Here are the real cases in this category, with excerpts from strong answers:
${caseList}

Produce JSON with exactly this shape:
{
  "subtitle": "one short line saying what this section teaches, under 12 words",
  "lesson": {
    "hook": "one punchy, slightly witty line that makes someone want to learn this. Under 18 words.",
    "what": "two plain sentences explaining the skill to a beginner",
    "how": ["three short practical steps, each under 16 words"],
    "example": "one concrete two-sentence example of doing it well, on a real product",
    "mistake": "the single most common mistake, in one sentence"
  },
  "questions": [
    {
      "caseTitle": "the case title, copied exactly from the list, or a new short title for a bonus case",
      "source": "case or bonus",
      "scenario": "one or two sentences of situation, specific and concrete",
      "question": "the question, testing this one skill only",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "why the right answer is right, in two plain sentences",
      "whyWrong": ["for each option: empty string for the correct one, otherwise one sentence on why a smart person might pick it and why it is still wrong"]
    }
  ]
}

RULES
Exactly ${QUESTIONS_PER_SECTION} questions. At least ${QUESTIONS_PER_SECTION - 2} must use cases from the list, spread across DIFFERENT cases. Exactly 2 must be "bonus" questions on real products not in the list.
Every wrong option must be something a real candidate would plausibly choose. No joke answers, no obviously silly options. The difficulty is the point.
Every option must be between 8 and 14 words. Count them. In at least 4 of the  questions, one of the WRONG options must be the longest option. The right answer must never be identifiable by being longer, more detailed or more hedged than the others.
Every question tests "${section.key.replace(/_/g, ' ')}" specifically, not some other skill.
Plain text only. No asterisks, no markdown, no em dashes.
${retryNote}
Return only the JSON.`
}

async function callGemini(prompt: string): Promise<any> {
    let lastErr = 'unknown'
    for (const model of GEMINI_MODEL_CHAIN) {
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                const r = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ role: 'user', parts: [{ text: prompt }] }],
                            generationConfig: { temperature: 0.8, responseMimeType: 'application/json' },
                        }),
                    }
                )
                const j: any = await r.json()
                if (!r.ok) { lastErr = j?.error?.message || `HTTP ${r.status}`; await new Promise(res => setTimeout(res, 1500)); continue }
                const text = j?.candidates?.[0]?.content?.parts?.[0]?.text
                if (text) return JSON.parse(text)
            } catch (e: any) { lastErr = e.message; await new Promise(res => setTimeout(res, 4000)) }
        }
    }
    throw new Error(lastErr)
}

/** Shuffle options so the right answer is not always in the same slot. */
function shuffleQuestion(q: any, seed: number) {
    const idx = [0, 1, 2, 3]
    let s = seed
    for (let i = idx.length - 1; i > 0; i--) {
        s = (s * 9301 + 49297) % 233280
        const j = Math.floor((s / 233280) * (i + 1))
            ;[idx[i], idx[j]] = [idx[j], idx[i]]
    }
    return {
        ...q,
        options: idx.map(i => q.options[i]),
        whyWrong: idx.map(i => q.whyWrong[i] ?? ''),
        correctIndex: idx.indexOf(q.correctIndex),
    }
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim()

/** Shared checks for any batch of questions. `existing` blocks repeats of questions already in the pool. */
function validateQuestions(raw: any, existing: string[] = []): { ok: boolean; problems: string[]; questions?: any[] } {
    const problems: string[] = []
    const seen = new Set(existing.map(norm))
    const qs = Array.isArray(raw?.questions) ? raw.questions : []

    const good = qs.filter((q: any) => {
        const ok =
            Array.isArray(q.options) && q.options.length === 4 &&
            new Set(q.options.map((o: string) => String(o).trim().toLowerCase())).size === 4 &&
            Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex < 4 &&
            q.question && q.explanation && !seen.has(norm(q.question))
        if (ok) seen.add(norm(q.question))
        return ok
    })
    if (good.length < QUESTIONS_PER_SECTION - 1) problems.push(`only ${good.length} usable new questions`)

    // The classic MCQ tell: the correct option is the longest one.
    const longestIsCorrect = good.filter((q: any) => {
        const lens = q.options.map((o: string) => o.length)
        return lens[q.correctIndex] === Math.max(...lens)
    }).length
    if (good.length && longestIsCorrect / good.length > 0.5) problems.push(`correct answer is the longest in ${longestIsCorrect}/${good.length}`)

    if (problems.length) return { ok: false, problems }

    const questions = good.slice(0, QUESTIONS_PER_SECTION).map((q: any, i: number) => shuffleQuestion({
        caseTitle: clean(q.caseTitle),
        source: q.source === 'bonus' ? 'bonus' : 'case',
        scenario: clean(q.scenario),
        question: clean(q.question),
        options: q.options.map((o: string) => clean(o).replace(/^[A-Da-d][.):]\s+/, '')),
        correctIndex: q.correctIndex,
        explanation: clean(q.explanation),
        whyWrong: (q.whyWrong || []).map(clean),
    }, i * 7919 + String(q.question).length + existing.length))
    return { ok: true, problems: [], questions }
}

function validateSection(raw: any): { ok: boolean; problems: string[]; section?: any } {
    const q = validateQuestions(raw)
    const problems = [...q.problems]
    if (!raw?.lesson?.what || !Array.isArray(raw?.lesson?.how)) problems.push('lesson missing')
    if (problems.length) return { ok: false, problems }

    const section = {
        subtitle: clean(raw.subtitle),
        lesson: {
            hook: clean(raw.lesson.hook),
            what: clean(raw.lesson.what),
            how: raw.lesson.how.slice(0, 4).map(clean),
            example: clean(raw.lesson.example),
            mistake: clean(raw.lesson.mistake),
        },
        questions: q.questions,
    }
    return { ok: true, problems: [], section }
}

/** Asks only for more questions, showing the model what already exists so it does not repeat itself. */
function buildExtendPrompt(categoryTitle: string, framework: string, section: { key: string; guidance: string }, cases: { title: string; excerpt: string }[], existing: string[], retryNote = '') {
    const caseList = cases.map((c, i) => `${i + 1}. ${c.title}\n   Model answer excerpt: ${c.excerpt}`).join('\n')
    const already = existing.map((q, i) => `${i + 1}. ${q}`).join('\n')
    return `You are adding questions to a learning game that teaches product managers how to crack ${categoryTitle} interview cases, using the ${framework} approach.

This section teaches ONE skill: ${section.key.replace(/_/g, ' ')}.
What good looks like: ${section.guidance}

Real cases in this category:
${caseList}

These questions ALREADY EXIST. Do not repeat them, and do not ask the same thing about the same case in different words:
${already}

Produce JSON: { "questions": [ ...exactly ${QUESTIONS_PER_SECTION} new questions... ] }
Each question has this shape:
{ "caseTitle": "case title copied exactly from the list, or a short title for a bonus case", "source": "case or bonus", "scenario": "one or two concrete sentences", "question": "tests this one skill only", "options": ["four options"], "correctIndex": 0, "explanation": "two plain sentences", "whyWrong": ["one entry per option, empty string for the correct one, otherwise why a smart person might pick it and why it is still wrong"] }

RULES
Prefer cases that the existing questions use least, so the whole category gets covered. Exactly 2 must be "bonus" questions on real products not in the list.
Every wrong option must be something a real candidate would plausibly choose. No joke answers.
Every option must be between 8 and 14 words. In at least 4 of the ${QUESTIONS_PER_SECTION} questions, a WRONG option must be the longest. The right answer must never stand out by being longer or more detailed.
Plain text only. No asterisks, no markdown, no em dashes, no A. B. C. D. prefixes.
${retryNote}
Return only the JSON.`
}

async function buildCategory(cat: typeof PLAYGROUND_CATEGORIES[number], force: boolean, target: number) {
    const file = `${OUT_DIR}/${cat.slug}.json`
    const existing = !force && existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null
    const rubric = getRubric(cat.dbCategory)

    const cases = await prisma.practiceQuestion.findMany({
        where: { category: cat.dbCategory },
        select: { title: true, solutionText: true },
    })
    const caseList = cases.map(c => ({ title: c.title, excerpt: clean((c.solutionText || '').slice(0, 320)) }))

    const out = existing || { slug: cat.slug, framework: rubric.framework, sections: {} as Record<string, any> }

    for (const dim of rubric.dimensions) {
        if (out.sections[dim.key]) continue
        let result: ReturnType<typeof validateSection> | null = null
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const note = result && !result.ok ? `A previous attempt was rejected because: ${result.problems.join('; ')}. Fix exactly that.` : ''
                const raw = await callGemini(buildPrompt(cat.title, rubric.framework, dim, caseList, note))
                result = validateSection(raw)
                if (result.ok) break
                console.log(`  ${cat.slug}/${dim.key} attempt ${attempt} rejected: ${result.problems.join('; ')}`)
            } catch (e: any) {
                console.log(`  ${cat.slug}/${dim.key} attempt ${attempt} error: ${e.message}`)
            }
        }
        if (!result?.ok) { console.log(`  FAILED ${cat.slug}/${dim.key}`); continue }
        out.sections[dim.key] = { key: dim.key, competency: dim.competency, ...result.section }
        writeFileSync(file, JSON.stringify(out, null, 2))
        console.log(`  ok ${cat.slug}/${dim.key} (${result.section.questions.length} questions)`)
    }

    // Grow each section's pool up to `target`, in batches, without repeats.
    for (const dim of rubric.dimensions) {
        const sec = out.sections[dim.key]
        if (!sec) continue
        while (sec.questions.length < target) {
            const existingQs: string[] = sec.questions.map((q: any) => q.question)
            let batch: ReturnType<typeof validateQuestions> | null = null
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    const note = batch && !batch.ok ? `A previous attempt was rejected because: ${batch.problems.join('; ')}. Fix exactly that.` : ''
                    const raw = await callGemini(buildExtendPrompt(cat.title, rubric.framework, dim, caseList, existingQs, note))
                    batch = validateQuestions(raw, existingQs)
                    if (batch.ok) break
                    console.log(`  ${cat.slug}/${dim.key} extend attempt ${attempt} rejected: ${batch.problems.join('; ')}`)
                } catch (e: any) {
                    console.log(`  ${cat.slug}/${dim.key} extend attempt ${attempt} error: ${e.message}`)
                }
            }
            if (!batch?.ok) { console.log(`  FAILED extend ${cat.slug}/${dim.key}`); break }
            sec.questions.push(...batch.questions!.slice(0, target - sec.questions.length))
            writeFileSync(file, JSON.stringify(out, null, 2))
            console.log(`  ok ${cat.slug}/${dim.key} now ${sec.questions.length} questions`)
        }
    }
    return out
}

async function main() {
    const force = process.argv.includes('--force')
    const onlyIdx = process.argv.indexOf('--only')
    const only = onlyIdx >= 0 ? process.argv[onlyIdx + 1] : null
    const targetIdx = process.argv.indexOf('--target')
    const target = targetIdx >= 0 ? parseInt(process.argv[targetIdx + 1], 10) : QUESTIONS_PER_SECTION

    if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

    const cats = PLAYGROUND_CATEGORIES.filter(c => !only || c.slug === only)
    // Three categories at a time: fast enough, and gentle on the rate limit.
    const queue = [...cats]
    const workers = Array.from({ length: 3 }, async () => {
        while (queue.length) {
            const cat = queue.shift()!
            console.log(`\n>> ${cat.slug}`)
            await buildCategory(cat, force, target)
        }
    })
    await Promise.all(workers)
    console.log('\ndone. Nothing written to the database.')
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1) }).finally(() => prisma.$disconnect())
