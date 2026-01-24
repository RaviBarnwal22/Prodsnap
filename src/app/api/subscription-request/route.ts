import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { sendPaymentNotification, sendPaymentConfirmationToUser } from "@/lib/email"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const user = await getUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { name, phone, paymentProof } = body

        // Validate required fields
        if (!name || !phone || !paymentProof) {
            return NextResponse.json(
                { error: "Name, phone, and payment proof are required" },
                { status: 400 }
            )
        }

        // Check for existing pending request
        const existingRequest = await prisma.subscriptionRequest.findFirst({
            where: {
                userId: user.id,
                status: "pending"
            }
        })

        if (existingRequest) {
            return NextResponse.json(
                { error: "You already have a pending subscription request. Please wait for admin approval." },
                { status: 400 }
            )
        }

        // Create subscription request
        const subscriptionRequest = await prisma.subscriptionRequest.create({
            data: {
                userId: user.id,
                name,
                email: user.email,
                phone,
                paymentProof,
                amount: 199,
                status: "pending"
            }
        })

        // Send email notification to admin (don't block on failure)
        await sendPaymentNotification({
            name,
            email: user.email,
            phone,
            amount: 199
        }).catch(err => console.error('Admin email notification failed:', err))

        // Send confirmation email to user
        await sendPaymentConfirmationToUser({
            name,
            email: user.email,
            amount: 199
        }).catch(err => console.error('User confirmation email failed:', err))

        return NextResponse.json({
            success: true,
            message: "Subscription request submitted successfully",
            requestId: subscriptionRequest.id
        })
    } catch (error) {
        console.error("Error creating subscription request:", error)
        return NextResponse.json(
            { error: "Failed to submit subscription request" },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const user = await getUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Get user's subscription requests
        const requests = await prisma.subscriptionRequest.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" }
        })

        return NextResponse.json({ requests })
    } catch (error) {
        console.error("Error fetching subscription requests:", error)
        return NextResponse.json(
            { error: "Failed to fetch subscription requests" },
            { status: 500 }
        )
    }
}
