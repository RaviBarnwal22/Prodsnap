import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    console.log('--- Database Diagnostic Report (Last 24h) ---')

    // 1. AI Usage & Speed
    const aiStats = await prisma.apiUsageLog.groupBy({
        by: ['provider', 'status'],
        where: { createdAt: { gte: twentyFourHoursAgo } },
        _count: { id: true },
        _avg: { responseTime: true }
    })

    console.log('\nAI Engine performance:')
    if (aiStats.length === 0) {
        console.log('- No AI activity recorded in the last 24h.')
    }
    aiStats.forEach(stat => {
        console.log(`- ${stat.provider} (${stat.status}): ${stat._count.id} requests, Avg Speed: ${Math.round(stat._avg.responseTime || 0)}ms`)
    })

    // 2. Recent Errors (Detailed)
    const recentErrors = await prisma.apiUsageLog.findMany({
        where: {
            status: { in: ['error', 'rate_limit'] },
            createdAt: { gte: twentyFourHoursAgo }
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: { provider: true, errorMessage: true, createdAt: true, model: true }
    })

    if (recentErrors.length > 0) {
        console.log('\nRecent API Errors:')
        recentErrors.forEach(err => {
            console.log(`- [${err.createdAt.toISOString()}] ${err.provider} (${err.model}): ${err.errorMessage?.substring(0, 100)}...`)
        })
    }

    // 3. Traffic check on other models
    const submissions = await prisma.practiceSubmission.count({
        where: { createdAt: { gte: twentyFourHoursAgo } }
    })
    console.log(`\nPractice Submissions (Last 24h): ${submissions}`)

    // 4. Latest Success
    const latestSuccess = await prisma.apiUsageLog.findFirst({
        where: { status: 'success' },
        orderBy: { createdAt: 'desc' }
    })
    if (latestSuccess) {
        console.log(`\nLast successful AI interaction: ${latestSuccess.createdAt.toISOString()} (${latestSuccess.responseTime}ms)`)
    }

    await prisma.$disconnect()
}

main().catch(e => {
    console.error(e)
    process.exit(1)
})
