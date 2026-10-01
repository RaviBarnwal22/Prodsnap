/**
 * Writes the generated answers into PracticeQuestion.solutionText.
 *
 * Separate from generation on purpose: this is the step that touches the live
 * production database, so it is run deliberately and can be reviewed first.
 *
 * Only `solutionText` is written. `sampleAnswer` is left alone so the existing
 * content stays recoverable, and because solutionText is what the grader reads
 * first (see PRODUCT_SENSE_PROMPT: solutionText || sampleAnswer).
 *
 *   npx tsx scripts/apply-sample-answers.ts             dry run, prints a plan
 *   npx tsx scripts/apply-sample-answers.ts --write     performs the write
 *   npx tsx scripts/apply-sample-answers.ts --write --skip-warnings
 */
import dotenv from 'dotenv'
import { readFileSync, writeFileSync } from 'fs'
import { prisma } from '../src/lib/prisma'

dotenv.config()

const IN = 'scripts/generated-sample-answers.json'
const BACKUP = 'scripts/solutiontext-backup.json'

async function main() {
    const write = process.argv.includes('--write')
    const skipWarnings = process.argv.includes('--skip-warnings')

    const generated: Record<string, any> = JSON.parse(readFileSync(IN, 'utf8'))
    const entries = Object.entries(generated)

    const clean = entries.filter(([, v]) => !v.problems)
    const warned = entries.filter(([, v]) => v.problems)
    const toWrite = skipWarnings ? clean : entries

    console.log(`generated: ${entries.length}   clean: ${clean.length}   with warnings: ${warned.length}`)
    if (warned.length && !skipWarnings) {
        console.log(`\nwarnings will still be written (use --skip-warnings to hold them back):`)
        warned.slice(0, 10).forEach(([, v]) => console.log(`  ${v.words}w  ${v.problems.join('; ')}  ${v.title.slice(0, 50)}`))
    }

    if (!write) {
        console.log(`\nDRY RUN. ${toWrite.length} rows would be updated. Re-run with --write.`)
        return
    }

    // Snapshot whatever is there now, so the previous content is recoverable
    // even though only solutionText is being replaced.
    const existing = await prisma.practiceQuestion.findMany({
        where: { id: { in: toWrite.map(([id]) => id) } },
        select: { id: true, title: true, solutionText: true },
    })
    writeFileSync(BACKUP, JSON.stringify(existing, null, 2))
    console.log(`\nbacked up ${existing.length} current solutionText values to ${BACKUP}`)

    let updated = 0
    for (const [id, v] of toWrite) {
        try {
            await prisma.practiceQuestion.update({
                where: { id },
                data: { solutionText: v.answer },
            })
            updated++
        } catch (e: any) {
            console.error(`  failed ${id}: ${e.message}`)
        }
    }

    console.log(`\nupdated ${updated} of ${toWrite.length} rows.`)
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1) }).finally(() => prisma.$disconnect())
