import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { sendApprovalNotification } from "@/lib/email"
import { NextRequest, NextResponse } from "next/server"

// Get all subscription requests (admin only)
export async function GET(request: NextRequest) {
    try {
        const user = await getUser()

        // Check admin access
        const isAdmin = user?.email === 'ravibarnwal89@gmail.com' || user?.role === 'ADMIN'
        if (!user || !isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const requests = await prisma.subscriptionRequest.findMany({
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

// Approve or reject a subscription request
export async function PUT(request: NextRequest) {
    try {
        const user = await getUser()

        // Check admin access
        const isAdmin = user?.email === 'ravibarnwal89@gmail.com' || user?.role === 'ADMIN'
        if (!user || !isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { requestId, action, endDate, notes } = body

        if (!requestId || !action) {
            return NextResponse.json(
                { error: "Request ID and action are required" },
                { status: 400 }
            )
        }

        if (action !== "approve" && action !== "reject") {
            return NextResponse.json(
                { error: "Invalid action. Must be 'approve' or 'reject'" },
                { status: 400 }
            )
        }

        // Get the subscription request
        const subscriptionRequest = await prisma.subscriptionRequest.findUnique({
            where: { id: requestId }
        })

        if (!subscriptionRequest) {
            return NextResponse.json(
                { error: "Subscription request not found" },
                { status: 404 }
            )
        }

        // Update the request status
        await prisma.subscriptionRequest.update({
            where: { id: requestId },
            data: {
                status: action === "approve" ? "approved" : "rejected",
                reviewedBy: user.id,
                reviewedAt: new Date(),
                adminNotes: notes || null
            }
        })

        // If approved, update or create user subscription
        if (action === "approve") {
            const subscriptionEndDate = endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default 30 days

            await prisma.subscription.upsert({
                where: { userId: subscriptionRequest.userId },
                update: {
                    status: "active",
                    planType: "monthly",
                    startDate: new Date(),
                    endDate: subscriptionEndDate
                },
                create: {
                    userId: subscriptionRequest.userId,
                    status: "active",
                    planType: "monthly",
                    priceINR: 199,
                    startDate: new Date(),
                    endDate: subscriptionEndDate
                }
            })

            // Send congratulations email to user
            await sendApprovalNotification({
                name: subscriptionRequest.name,
                email: subscriptionRequest.email,
                endDate: subscriptionEndDate
            }).catch(err => console.error('Approval email failed:', err))
        }

        return NextResponse.json({
            success: true,
            message: action === "approve"
                ? "Subscription approved successfully"
                : "Subscription request rejected"
        })
    } catch (error) {
        console.error("Error processing subscription request:", error)
        return NextResponse.json(
            { error: "Failed to process subscription request" },
            { status: 500 }
        )
    }
}
