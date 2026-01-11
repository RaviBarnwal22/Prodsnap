import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { sendMentorshipBookingConfirmation, sendMentorshipPaymentNotification } from "@/lib/email"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const user = await getUser()
        const body = await request.json()
        const { name, phone, serviceType, paymentProof, amount, email } = body

        // If user is logged in, use their email as fallback or override
        const contactEmail = user?.email || email

        if (!contactEmail) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            )
        }

        // Validate required fields
        if (!name || !phone || !serviceType || !paymentProof || !amount) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            )
        }

        // Create the mentorship booking
        const booking = await prisma.mentorshipBooking.create({
            data: {
                userId: user?.id, // Optional now
                name,
                email: contactEmail,
                phone,
                serviceType,
                paymentProof,
                amount,
                status: "pending"
            }
        })

        // Send booking confirmation to user
        sendMentorshipBookingConfirmation({
            name,
            email: contactEmail,
            serviceType,
            amount
        }).catch(err => console.error('User confirmation email failed:', err))

        // Send notification to admin
        sendMentorshipPaymentNotification({
            name,
            email: contactEmail,
            phone,
            serviceType,
            amount
        }).catch(err => console.error('Admin notification email failed:', err))

        return NextResponse.json({
            success: true,
            message: "Mentorship session booked successfully",
            bookingId: booking.id
        })
    } catch (error) {
        console.error("Error creating mentorship booking:", error)
        return NextResponse.json(
            { error: "Failed to book mentorship session" },
            { status: 500 }
        )
    }
}

// Get user's mentorship bookings
export async function GET(request: NextRequest) {
    try {
        const user = await getUser()

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const bookings = await prisma.mentorshipBooking.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            include: { feedback: true }
        })

        return NextResponse.json({ bookings })
    } catch (error) {
        console.error("Error fetching mentorship bookings:", error)
        return NextResponse.json(
            { error: "Failed to fetch bookings" },
            { status: 500 }
        )
    }
}
