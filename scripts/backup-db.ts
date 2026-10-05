/**
 * Read-only backup of every Prisma table to JSON.
 *
 * The free Supabase plan keeps no backups, and local dev writes to the live
 * database, so this is the recovery copy. It only ever reads.
 *
 *   npx tsx scripts/backup-db.ts
 *
 * Output: backups/<YYYY-MM-DD_HHMM>/<Model>.json, one file per table. The
 * backups/ folder is gitignored: it holds customer data and must never be
 * committed. Copy it somewhere safe (an encrypted drive or private cloud
 * folder), and delete old copies you no longer need.
 */
import dotenv from "dotenv"
import fs from "node:fs"
import path from "node:path"
import { Prisma, PrismaClient } from "@prisma/client"

dotenv.config({ path: ".env" })

const PAGE = 1000

async function main() {
    const prisma = new PrismaClient()
    const stamp = new Date().toISOString().slice(0, 16).replace("T", "_").replace(":", "")
    const dir = path.join("backups", stamp)
    fs.mkdirSync(dir, { recursive: true })

    let total = 0
    for (const model of Prisma.dmmf.datamodel.models) {
        const delegateName = model.name.charAt(0).toLowerCase() + model.name.slice(1)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const delegate = (prisma as any)[delegateName]
        const idField = model.fields.find((f) => f.isId)?.name
        if (!delegate || !idField) {
            console.warn(`skip ${model.name}: no delegate or single id field`)
            continue
        }

        const rows: unknown[] = []
        let cursor: unknown = undefined
        for (;;) {
            const page: Record<string, unknown>[] = await delegate.findMany({
                take: PAGE,
                orderBy: { [idField]: "asc" },
                ...(cursor !== undefined ? { skip: 1, cursor: { [idField]: cursor } } : {}),
            })
            rows.push(...page)
            if (page.length < PAGE) break
            cursor = page[page.length - 1][idField]
        }

        fs.writeFileSync(path.join(dir, `${model.name}.json`), JSON.stringify(rows, null, 2))
        console.log(`${model.name.padEnd(24)} ${rows.length}`)
        total += rows.length
    }

    await prisma.$disconnect()
    console.log(`\n${total} rows written to ${dir}`)
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
