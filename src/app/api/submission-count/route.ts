import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const user = await getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get submission count
        const submissions = await prisma.practiceSubmission.findMany({
            where: { userId: user.id },
            select: {
                id: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        const submissionCount = submissions.length

        return NextResponse.json({
            success: true,
            count: submissionCount,
            shouldShowMentorSuggestion: submissionCount >= 5
        })
    } catch (error) {
        console.error('Error fetching submission count:', error)
        return NextResponse.json(
            { error: 'Failed to fetch submission count' },
            { status: 500 }
        )
    }
}
