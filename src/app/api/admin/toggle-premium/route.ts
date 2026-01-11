import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const currentUser = await getUser()

        // Check if user is admin
        const isAdmin = currentUser?.email === 'ravibarnwal89@gmail.com' || currentUser?.role === 'ADMIN'
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { userId, isPremium, endDate } = await request.json()

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        if (isPremium) {
            // Enable premium - create or update subscription
            await prisma.subscription.upsert({
                where: { userId },
                update: {
                    status: 'active',
                    planType: 'admin_granted',
                    endDate: endDate ? new Date(endDate) : null,
                    updatedAt: new Date()
                },
                create: {
                    userId,
                    status: 'active',
                    planType: 'admin_granted',
                    endDate: endDate ? new Date(endDate) : null
                }
            })
        } else {
            // Disable premium - update subscription to inactive
            const existingSubscription = await prisma.subscription.findUnique({
                where: { userId }
            })

            if (existingSubscription) {
                await prisma.subscription.update({
                    where: { userId },
                    data: {
                        status: 'inactive',
                        updatedAt: new Date()
                    }
                })
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error toggling premium:', error)
        return NextResponse.json({ error: 'Failed to update premium status' }, { status: 500 })
    }
}
