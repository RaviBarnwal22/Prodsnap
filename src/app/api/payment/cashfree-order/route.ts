import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { createCashfreeOrder } from "@/lib/cashfree"

export async function POST(request: NextRequest) {
    try {
        const user = await getUser()
        const body = await request.json()
        const {
            type = 'mentorship',
            name,
            email,
            phone,
            serviceType,
            amount,
            linkedinProfile,
            messageToMentor,
            planType = 'monthly'
        } = body

        // Resolve customer email and name
        const contactEmail = email || user?.email
        const contactName = name || user?.name || user?.firstName || 'Learner'
        const contactPhone = phone || ''

        if (!contactEmail) {
            return NextResponse.json(
                { error: "Email is required to proceed" },
                { status: 400 }
            )
        }

        if (!contactName) {
            return NextResponse.json(
                { error: "Name is required to proceed" },
                { status: 400 }
            )
        }

        // Determine request origin for callback - Cashfree strictly requires https:// for return_url
        const envUrl = process.env.NEXT_PUBLIC_APP_URL
        let origin = envUrl && envUrl.startsWith('https://') ? envUrl : 'https://prodsnap.in'

        if (type === 'mentorship') {
            if (!serviceType || !amount || Number(amount) <= 0) {
                return NextResponse.json(
                    { error: "Valid mentorship service and amount are required" },
                    { status: 400 }
                )
            }

            const numericAmount = Math.round(Number(amount))
            // Cashfree order ID must be alphanumeric and underscore, max 45 chars
            const orderId = `mentor_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

            // Create pending booking in DB with orderId in paymentProof
            const booking = await prisma.mentorshipBooking.create({
                data: {
                    userId: user?.id || null,
                    name: contactName,
                    email: contactEmail,
                    phone: contactPhone,
                    serviceType,
                    paymentProof: orderId,
                    amount: numericAmount,
                    linkedinProfile: linkedinProfile || null,
                    messageToMentor: messageToMentor || null,
                    status: "pending"
                }
            })

            // Create Cashfree Order
            const cfOrder = await createCashfreeOrder({
                orderId,
                orderAmount: numericAmount,
                customerDetails: {
                    customerId: user?.id || `guest_${Date.now()}`,
                    customerName: contactName,
                    customerEmail: contactEmail,
                    customerPhone: contactPhone
                },
                orderMeta: {
                    returnUrl: `${origin}/payment/status?order_id={order_id}&type=mentorship`
                },
                orderNote: `Mentorship: ${serviceType}`
            })

            return NextResponse.json({
                success: true,
                orderId,
                paymentSessionId: cfOrder.payment_session_id,
                bookingId: booking.id,
                environment: process.env.CASHFREE_ENV || 'production'
            })
        } else if (type === 'subscription') {
            const numericAmount = Math.round(Number(amount || 199))
            const orderId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

            // Log pending subscription request
            await prisma.subscriptionRequest.create({
                data: {
                    userId: user?.id || `guest_${Date.now()}`,
                    name: contactName,
                    email: contactEmail,
                    phone: contactPhone,
                    paymentProof: orderId,
                    amount: numericAmount,
                    status: "pending"
                }
            })

            // Create Cashfree Order
            const cfOrder = await createCashfreeOrder({
                orderId,
                orderAmount: numericAmount,
                customerDetails: {
                    customerId: user?.id || `guest_${Date.now()}`,
                    customerName: contactName,
                    customerEmail: contactEmail,
                    customerPhone: contactPhone
                },
                orderMeta: {
                    returnUrl: `${origin}/payment/status?order_id={order_id}&type=subscription`
                },
                orderNote: `Prodsnap Premium Subscription (${planType})`
            })

            return NextResponse.json({
                success: true,
                orderId,
                paymentSessionId: cfOrder.payment_session_id,
                environment: process.env.CASHFREE_ENV || 'production'
            })
        } else {
            return NextResponse.json(
                { error: "Invalid order type specified" },
                { status: 400 }
            )
        }
    } catch (error: any) {
        console.error("[Cashfree Order Creation Error]:", error)
        return NextResponse.json(
            { error: error?.message || "Failed to initiate payment session with Cashfree" },
            { status: 500 }
        )
    }
}
