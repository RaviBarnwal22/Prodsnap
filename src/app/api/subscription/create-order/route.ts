import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { getUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const user = await getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { amount } = await request.json()

        // Initialize Razorpay
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || '',
            key_secret: process.env.RAZORPAY_KEY_SECRET || ''
        })

        // Create order
        const order = await razorpay.orders.create({
            amount: amount * 100, // Razorpay expects amount in paise
            currency: 'INR',
            receipt: `sub_${user.id}_${Date.now()}`,
            notes: {
                userId: user.id,
                planType: 'monthly'
            }
        })

        return NextResponse.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
            userName: user.firstName || user.name || '',
            userEmail: user.email
        })
    } catch (error) {
        console.error('[create-order] Error:', error)
        return NextResponse.json(
            { error: 'Failed to create order' },
            { status: 500 }
        )
    }
}
