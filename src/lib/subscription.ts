'use server'

import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { FREE_ATTEMPT_LIMIT } from "@/lib/constants"

// Check if user has an active subscription
export async function hasActiveSubscription(): Promise<boolean> {
    const user = await getUser()
    if (!user) return false

    const subscription = await prisma.subscription.findUnique({
        where: { userId: user.id }
    })

    if (!subscription) return false

    // Check if subscription is active and not expired
    if (subscription.status !== 'active') return false

    if (subscription.endDate && new Date(subscription.endDate) < new Date()) {
        // Subscription expired, update status
        await prisma.subscription.update({
            where: { userId: user.id },
            data: { status: 'inactive' }
        })
        return false
    }

    return true
}

// Get TOTAL attempt count across ALL categories
export async function getTotalAttemptCount(): Promise<number> {
    const user = await getUser()
    if (!user) return 0

    const attempts = await prisma.categoryAttempt.findMany({
        where: { userId: user.id }
    })

    // Sum all attempts across all categories
    return attempts.reduce((total, attempt) => total + attempt.count, 0)
}

// Check if user can attempt a question (checks TOTAL attempts across all categories)
export async function canAttemptCategory(category: string): Promise<{
    canAttempt: boolean
    attemptsUsed: number
    attemptsRemaining: number
    isPremium: boolean
}> {
    // category param kept for compatibility but we now check total attempts
    void category

    const user = await getUser()
    if (!user) {
        return {
            canAttempt: false,
            attemptsUsed: 0,
            attemptsRemaining: 0,
            isPremium: false
        }
    }

    // Check subscription status
    const isPremium = await hasActiveSubscription()
    if (isPremium) {
        return {
            canAttempt: true,
            attemptsUsed: 0,
            attemptsRemaining: -1, // Unlimited
            isPremium: true
        }
    }

    // Get TOTAL attempt count across ALL categories for free users
    const attemptsUsed = await getTotalAttemptCount()
    const attemptsRemaining = Math.max(0, FREE_ATTEMPT_LIMIT - attemptsUsed)

    return {
        canAttempt: attemptsUsed < FREE_ATTEMPT_LIMIT,
        attemptsUsed,
        attemptsRemaining,
        isPremium: false
    }
}

// Increment attempt count (stores category for tracking but limit is global)
export async function incrementCategoryAttempt(category: string): Promise<void> {
    const user = await getUser()
    if (!user) return

    await prisma.categoryAttempt.upsert({
        where: {
            userId_category: {
                userId: user.id,
                category
            }
        },
        update: {
            count: { increment: 1 }
        },
        create: {
            userId: user.id,
            category,
            count: 1
        }
    })
}

// Get all category attempts for a user (for admin/analytics)
export async function getAllCategoryAttempts(): Promise<Record<string, number>> {
    const user = await getUser()
    if (!user) return {}

    const attempts = await prisma.categoryAttempt.findMany({
        where: { userId: user.id }
    })

    return attempts.reduce((acc: Record<string, number>, attempt) => {
        acc[attempt.category] = attempt.count
        return acc
    }, {} as Record<string, number>)
}

// Get user subscription status
export async function getSubscriptionStatus(): Promise<{
    isPremium: boolean
    subscription: {
        status: string
        planType: string
        endDate: Date | null
    } | null
}> {
    const user = await getUser()
    if (!user) {
        return { isPremium: false, subscription: null }
    }

    const subscription = await prisma.subscription.findUnique({
        where: { userId: user.id }
    })

    if (!subscription) {
        return { isPremium: false, subscription: null }
    }

    const isPremium = subscription.status === 'active' &&
        (!subscription.endDate || new Date(subscription.endDate) >= new Date())

    return {
        isPremium,
        subscription: {
            status: subscription.status,
            planType: subscription.planType,
            endDate: subscription.endDate
        }
    }
}
