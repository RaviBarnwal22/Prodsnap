import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { sendFeedbackRequestEmail, sendMentorshipScheduledEmail } from "@/lib/email"
import { NextRequest, NextResponse } from "next/server"

// Get all mentorship bookings (admin only)
export async function GET(request: NextRequest) {
    try {
        const user = await getUser()

        // Check admin access
        const isAdmin = user?.email === 'ravibarnwal89@gmail.com' || user?.role === 'ADMIN'
        if (!user || !isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const bookings = await prisma.mentorshipBooking.findMany({
            orderBy: { createdAt: "desc" },
            include: { feedback: true }
        })

        return NextResponse.json({ bookings })
    } catch (error) {
        console.error("Error fetching mentorship bookings:", error)
        return NextResponse.json(
            { error: "Failed to fetch mentorship bookings" },
            { status: 500 }
        )
    }
}

// Update mentorship booking (approve, complete, cancel)
export async function PUT(request: NextRequest) {
    try {
        const user = await getUser()

        // Check admin access
        const isAdmin = user?.email === 'ravibarnwal89@gmail.com' || user?.role === 'ADMIN'
        if (!user || !isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { bookingId, action, notes } = body

        if (!bookingId || !action) {
            return NextResponse.json(
                { error: "Booking ID and action are required" },
                { status: 400 }
            )
        }

        const validActions = ["approve", "complete", "cancel"]
        if (!validActions.includes(action)) {
            return NextResponse.json(
                { error: "Invalid action. Must be 'approve', 'complete', or 'cancel'" },
                { status: 400 }
            )
        }

        // Get the booking
        const booking = await prisma.mentorshipBooking.findUnique({
            where: { id: bookingId }
        })

        if (!booking) {
            return NextResponse.json(
                { error: "Booking not found" },
                { status: 404 }
            )
        }

        // Determine new status
        let newStatus = booking.status
        let completedAt = booking.completedAt
        let scheduledAt = booking.scheduledAt
        let meetingLink = booking.meetingLink

        if (action === "approve") {
            newStatus = "approved"
            if (body.scheduledAt) scheduledAt = new Date(body.scheduledAt)
            if (body.meetingLink) meetingLink = body.meetingLink
        } else if (action === "complete") {
            newStatus = "completed"
            completedAt = new Date()
        } else if (action === "cancel") {
            newStatus = "cancelled"
        }

        // Update the booking
        await prisma.mentorshipBooking.update({
            where: { id: bookingId },
            data: {
                status: newStatus,
                completedAt,
                scheduledAt,
                meetingLink,
                reviewedBy: user.id,
                reviewedAt: new Date(),
                adminNotes: notes || null
            }
        })

        // If approved and scheduled, send confirmation email
        if (action === "approve" && scheduledAt && meetingLink) {
            await sendMentorshipScheduledEmail({
                name: booking.name,
                email: booking.email,
                serviceType: booking.serviceType,
                scheduledAt: scheduledAt,
                meetingLink: meetingLink
            }).catch(err => console.error('Scheduled email failed:', err))
        }

        // If completed, send feedback request email
        if (action === "complete") {
            await sendFeedbackRequestEmail({
                name: booking.name,
                email: booking.email,
                bookingId: booking.id,
                serviceType: booking.serviceType
            }).catch(err => console.error('Feedback request email failed:', err))
        }

        return NextResponse.json({
            success: true,
            message: action === "approve"
                ? "Booking approved successfully"
                : action === "complete"
                    ? "Session marked as complete. Feedback request sent to user."
                    : "Booking cancelled"
        })
    } catch (error) {
        console.error("Error processing mentorship booking:", error)
        // detailed log
        if (error instanceof Error) {
            console.error(error.stack)
        }
        return NextResponse.json(
            { error: "Failed to process booking " + (error as Error).message },
            { status: 500 }
        )
    }
}
