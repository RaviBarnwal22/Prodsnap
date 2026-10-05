import { NextRequest, NextResponse } from "next/server"
import { after } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCashfreeOrder } from "@/lib/cashfree"
import { logEvent } from "@/lib/analytics"
import { grantAiAccessBonus } from "@/lib/ai-bonus"
import {
    sendMentorshipBookingConfirmation,
    sendMentorshipPaymentNotification,
    sendApprovalNotification
} from "@/lib/email"

async function verifyOrder(orderId: string) {
    if (!orderId) {
        return { error: "Order ID is required", status: 400 }
    }

    const cfOrder = await getCashfreeOrder(orderId)
    const isPaid = cfOrder.order_status === 'PAID'

    if (!isPaid) {
        return {
            success: false,
            status: cfOrder.order_status,
            message: `Payment is currently ${cfOrder.order_status.toLowerCase()}`
        }
    }

    // Check if it's a mentorship booking
    const booking = await prisma.mentorshipBooking.findFirst({
        where: { paymentProof: orderId }
    })

    if (booking) {
        if (booking.status !== 'confirmed') {
            await prisma.mentorshipBooking.update({
                where: { id: booking.id },
                data: {
                    status: 'confirmed',
                    adminNotes: `Auto-verified via Cashfree. Order ID: ${orderId}, CF Order ID: ${cfOrder.cf_order_id}`
                }
            })

            // Send after the response, not alongside it. A bare floating promise
            // is not safe on serverless: once the response is returned the
            // instance can be frozen or torn down, killing the in-flight SMTP
            // conversation, so a confirmation could silently never be sent.
            // `after()` keeps the invocation alive until this finishes while
            // still not blocking the user's redirect.
            after(async () => {
                await sendMentorshipBookingConfirmation({
                    name: booking.name,
                    email: booking.email,
                    serviceType: booking.serviceType,
                    amount: booking.amount
                }).catch(err => console.error('[Email] Mentorship booking confirmation failed:', err))

                await sendMentorshipPaymentNotification({
                    name: booking.name,
                    email: booking.email,
                    phone: booking.phone,
                    serviceType: booking.serviceType,
                    amount: booking.amount
                }).catch(err => console.error('[Email] Mentorship payment admin notification failed:', err))
            })

            await grantAiAccessBonus(booking.userId, booking.email, booking.serviceType)

            // Inside the status guard, so a repeated verify (the page polls) does
            // not count the same purchase twice.
            await logEvent('purchase_completed', '/payment/status', booking.userId, booking.serviceType)
        }

        // Deliberately omits customer name / booking id: this endpoint is reachable
        // by anyone holding an order id, so it returns only receipt details.
        return {
            success: true,
            status: 'PAID',
            type: 'mentorship',
            serviceType: booking.serviceType,
            amount: booking.amount
        }
    }

    // Check if it's a subscription request
    const subRequest = await prisma.subscriptionRequest.findFirst({
        where: { paymentProof: orderId }
    })

    if (subRequest) {
        if (subRequest.status !== 'approved') {
            await prisma.subscriptionRequest.update({
                where: { id: subRequest.id },
                data: {
                    status: 'approved',
                    adminNotes: `Auto-verified via Cashfree. CF Order ID: ${cfOrder.cf_order_id}`
                }
            })

            // If a registered user exists for this email, activate subscription
            const user = await prisma.user.findUnique({
                where: { email: subRequest.email }
            })

            if (user) {
                const startDate = new Date()
                const endDate = new Date()
                endDate.setMonth(endDate.getMonth() + 1)

                await prisma.subscription.upsert({
                    where: { userId: user.id },
                    update: {
                        status: 'active',
                        startDate,
                        endDate,
                        priceINR: subRequest.amount
                    },
                    create: {
                        userId: user.id,
                        status: 'active',
                        planType: 'monthly',
                        priceINR: subRequest.amount,
                        startDate,
                        endDate
                    }
                })

                // Same reasoning as the mentorship emails above — see `after()` there.
                after(async () => {
                    await sendApprovalNotification({
                        name: subRequest.name,
                        email: subRequest.email,
                        endDate
                    }).catch((err: unknown) => console.error('[Email] Subscription approval email failed:', err))
                })

                await logEvent('purchase_completed', '/payment/status', user.id, 'subscription')
            }
        }

        return {
            success: true,
            status: 'PAID',
            type: 'subscription',
            amount: subRequest.amount
        }
    }

    return {
        success: true,
        status: 'PAID',
        message: 'Payment verified successfully.'
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { orderId } = body
        const result = await verifyOrder(orderId)

        if ('error' in result && result.error) {
            return NextResponse.json({ error: result.error }, { status: result.status })
        }

        return NextResponse.json(result)
    } catch (error: any) {
        console.error('[Cashfree Verification Error]:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to verify payment status with Cashfree' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const orderId = searchParams.get('order_id') || searchParams.get('orderId') || ''
        const result = await verifyOrder(orderId)

        if ('error' in result && result.error) {
            return NextResponse.json({ error: result.error }, { status: result.status })
        }

        return NextResponse.json(result)
    } catch (error: any) {
        console.error('[Cashfree Verification GET Error]:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to verify payment status with Cashfree' },
            { status: 500 }
        )
    }
}
