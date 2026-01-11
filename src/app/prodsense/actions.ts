'use server'

import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"

// Get today's puzzle
export async function getTodaysPuzzle() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const puzzle = await prisma.dailyPuzzle.findFirst({
        where: {
            publishDate: {
                gte: today,
                lt: tomorrow
            }
        }
    })

    return puzzle
}

// Get user's streak data
export async function getUserStreak() {
    const user = await getUser()
    if (!user) return null

    let streak = await prisma.userStreak.findUnique({
        where: { userId: user.id }
    })

    // Create streak record if doesn't exist
    if (!streak) {
        streak = await prisma.userStreak.create({
            data: {
                userId: user.id,
                currentStreak: 0,
                longestStreak: 0,
                totalCorrect: 0,
                totalPlayed: 0
            }
        })
    }

    return streak
}

// Check if user already attempted today's puzzle
export async function hasAttemptedToday(puzzleId: string) {
    const user = await getUser()
    if (!user) return false

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const attempt = await prisma.puzzleAttempt.findFirst({
        where: {
            userId: user.id,
            puzzleId,
            createdAt: {
                gte: today
            }
        }
    })

    return !!attempt
}

// Get user's attempt for a puzzle
export async function getUserAttempt(puzzleId: string) {
    const user = await getUser()
    if (!user) return null

    return await prisma.puzzleAttempt.findFirst({
        where: {
            userId: user.id,
            puzzleId
        }
    })
}

// Submit puzzle answer
export async function submitPuzzleAnswer(puzzleId: string, answer: string, timeTaken: number) {
    const user = await getUser()
    if (!user) {
        return { success: false, error: "Please login to play" }
    }

    // Check if already attempted
    const existingAttempt = await prisma.puzzleAttempt.findFirst({
        where: {
            userId: user.id,
            puzzleId
        }
    })

    if (existingAttempt) {
        return { success: false, error: "Already attempted today" }
    }

    // Get the puzzle
    const puzzle = await prisma.dailyPuzzle.findUnique({
        where: { id: puzzleId }
    })

    if (!puzzle) {
        return { success: false, error: "Puzzle not found" }
    }

    const isCorrect = answer === puzzle.correctAnswer

    // Create attempt
    await prisma.puzzleAttempt.create({
        data: {
            userId: user.id,
            puzzleId,
            answer,
            isCorrect,
            timeTaken
        }
    })

    // Update streak
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let streak = await prisma.userStreak.findUnique({
        where: { userId: user.id }
    })

    if (!streak) {
        streak = await prisma.userStreak.create({
            data: {
                userId: user.id,
                currentStreak: 0,
                longestStreak: 0,
                totalCorrect: 0,
                totalPlayed: 0
            }
        })
    }

    // Calculate new streak
    let newCurrentStreak = streak.currentStreak

    if (streak.lastPlayedAt) {
        const lastPlayed = new Date(streak.lastPlayedAt)
        lastPlayed.setHours(0, 0, 0, 0)

        if (lastPlayed.getTime() === yesterday.getTime()) {
            // Played yesterday, continue streak
            newCurrentStreak = streak.currentStreak + 1
        } else if (lastPlayed.getTime() < yesterday.getTime()) {
            // Missed a day, reset streak
            newCurrentStreak = 1
        }
        // If played today already, keep current streak (shouldn't happen due to check above)
    } else {
        // First time playing
        newCurrentStreak = 1
    }

    const newLongestStreak = Math.max(streak.longestStreak, newCurrentStreak)

    await prisma.userStreak.update({
        where: { userId: user.id },
        data: {
            currentStreak: newCurrentStreak,
            longestStreak: newLongestStreak,
            lastPlayedAt: new Date(),
            totalPlayed: streak.totalPlayed + 1,
            totalCorrect: isCorrect ? streak.totalCorrect + 1 : streak.totalCorrect
        }
    })

    return {
        success: true,
        isCorrect,
        correctAnswer: puzzle.correctAnswer,
        explanation: puzzle.explanation,
        newStreak: newCurrentStreak
    }
}

// Get leaderboard
export async function getPuzzleLeaderboard() {
    const streaks = await prisma.userStreak.findMany({
        orderBy: [
            { longestStreak: 'desc' },
            { totalCorrect: 'desc' }
        ],
        take: 10,
        include: {
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true
                }
            }
        }
    })

    return streaks.map((s, i) => ({
        rank: i + 1,
        name: s.user.firstName ? `${s.user.firstName} ${s.user.lastName?.[0] || ''}.` : s.user.email.split('@')[0],
        currentStreak: s.currentStreak,
        longestStreak: s.longestStreak,
        totalCorrect: s.totalCorrect,
        totalPlayed: s.totalPlayed,
        accuracy: s.totalPlayed > 0 ? Math.round((s.totalCorrect / s.totalPlayed) * 100) : 0
    }))
}
