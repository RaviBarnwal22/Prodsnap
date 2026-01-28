import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasActiveSubscription } from '@/lib/subscription'

const FREE_ATTEMPT_LIMIT = 3

export async function POST(request: NextRequest) {
    try {
        const user = await getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { category } = await request.json()

        if (!category) {
            return NextResponse.json({ error: 'Category is required' }, { status: 400 })
        }

        // Check if user has premium access
        const isPremium = await hasActiveSubscription()

        if (isPremium) {
            // Premium users have unlimited attempts
            return NextResponse.json({ success: true, isPremium: true })
        }

        // Count existing attempts for this category
        const attemptsCount = await prisma.practiceSubmission.count({
            where: {
                userId: user.id,
                question: {
                    category: category
                }
            }
        })

        if (attemptsCount >= FREE_ATTEMPT_LIMIT) {
            return NextResponse.json({
                error: 'Attempt limit reached',
                attemptsUsed: attemptsCount,
                limit: FREE_ATTEMPT_LIMIT
            }, { status: 403 })
        }

        return NextResponse.json({
            success: true,
            attemptsUsed: attemptsCount,
            attemptsRemaining: FREE_ATTEMPT_LIMIT - attemptsCount,
            isPremium: false
        })
    } catch (error) {
        console.error('Error in start-attempt:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
