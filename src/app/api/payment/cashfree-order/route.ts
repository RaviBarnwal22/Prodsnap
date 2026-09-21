import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { createCashfreeOrder } from "@/lib/cashfree"
import { getMentorshipPrice, SUBSCRIPTION_PRICE } from "@/lib/constants"

export async function POST(request: NextRequest) {
    try {
        // Login is required to buy. The package grid is public (so it can be indexed),
        // so this route is the real gate — without it anyone can create bookings,
        // pollute the admin queue and burn Cashfree order quota anonymously.
        const user = await getUser()
        if (!user) {
            return NextResponse.json(
                { error: "Please sign in to continue with payment." },
                { status: 401 }
            )
        }

        const body = await request.json()
        const {
            type = 'mentorship',
            name,
            email,
            phone,
            serviceType,
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

        // Cashfree requires https:// for return_url in production; sandbox accepts a local http origin.
        const envUrl = process.env.NEXT_PUBLIC_APP_URL
        const isSandbox = (process.env.CASHFREE_ENV || 'production') !== 'production'
        const originAllowed = envUrl && (envUrl.startsWith('https://') || (isSandbox && envUrl.startsWith('http://')))
        const origin = originAllowed ? envUrl : 'https://prodsnap.in'

        if (type === 'mentorship') {
            const numericAmount = serviceType ? getMentorshipPrice(serviceType) : null
            if (numericAmount === null) {
                return NextResponse.json(
                    { error: "Unknown mentorship service" },
                    { status: 400 }
                )
            }
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
            const numericAmount = SUBSCRIPTION_PRICE
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
