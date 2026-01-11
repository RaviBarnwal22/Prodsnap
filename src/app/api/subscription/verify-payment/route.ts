import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const user = await getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json()

        // Verify signature
        const body = razorpay_order_id + '|' + razorpay_payment_id
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
            .update(body)
            .digest('hex')

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json(
                { error: 'Invalid payment signature' },
                { status: 400 }
            )
        }

        // Payment verified - create/update subscription
        const startDate = new Date()
        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + 1) // 1 month subscription

        await prisma.subscription.upsert({
            where: { userId: user.id },
            update: {
                status: 'active',
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                startDate,
                endDate,
                priceINR: 199
            },
            create: {
                userId: user.id,
                status: 'active',
                planType: 'monthly',
                priceINR: 199,
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                startDate,
                endDate
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Subscription activated successfully'
        })
    } catch (error) {
        console.error('[verify-payment] Error:', error)
        return NextResponse.json(
            { error: 'Payment verification failed' },
            { status: 500 }
        )
    }
}
