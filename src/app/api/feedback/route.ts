import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// Submit feedback for a mentorship session
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { bookingId, name, email, rating, feedback, wouldRecommend } = body

        // Validate required fields
        if (!bookingId || !name || !email || !rating || !feedback) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            )
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: "Rating must be between 1 and 5" },
                { status: 400 }
            )
        }

        // Check if booking exists
        const booking = await prisma.mentorshipBooking.findUnique({
            where: { id: bookingId },
            include: { feedback: true }
        })

        if (!booking) {
            return NextResponse.json(
                { error: "Booking not found" },
                { status: 404 }
            )
        }

        if (booking.feedback) {
            return NextResponse.json(
                { error: "Feedback already submitted for this session" },
                { status: 400 }
            )
        }

        // Create feedback
        const newFeedback = await prisma.mentorshipFeedback.create({
            data: {
                bookingId,
                name,
                email,
                rating,
                feedback,
                wouldRecommend: wouldRecommend ?? true
            }
        })

        return NextResponse.json({
            success: true,
            message: "Thank you for your feedback!",
            feedbackId: newFeedback.id
        })
    } catch (error) {
        console.error("Error submitting feedback:", error)
        return NextResponse.json(
            { error: "Failed to submit feedback" },
            { status: 500 }
        )
    }
}

// Get feedback by booking ID
export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url)
        const bookingId = url.searchParams.get('bookingId')

        if (!bookingId) {
            return NextResponse.json(
                { error: "Booking ID is required" },
                { status: 400 }
            )
        }

        const booking = await prisma.mentorshipBooking.findUnique({
            where: { id: bookingId },
            include: { feedback: true }
        })

        if (!booking) {
            return NextResponse.json(
                { error: "Booking not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({
            booking: {
                id: booking.id,
                name: booking.name,
                email: booking.email,
                serviceType: booking.serviceType,
                status: booking.status,
                hasFeedback: !!booking.feedback
            },
            feedback: booking.feedback
        })
    } catch (error) {
        console.error("Error fetching feedback:", error)
        return NextResponse.json(
            { error: "Failed to fetch feedback" },
            { status: 500 }
        )
    }
}
