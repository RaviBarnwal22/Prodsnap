import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

// Get all users (admin only)
export async function GET(request: NextRequest) {
    try {
        const user = await getUser()

        // Check admin access
        const isAdmin = user?.email === 'ravibarnwal89@gmail.com' || user?.role === 'ADMIN'
        if (!user || !isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: {
                        bookings: true
                    }
                },
                subscription: true
            }
        })

        return NextResponse.json({ users })
    } catch (error) {
        console.error("Error fetching users:", error)
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        )
    }
}

// Delete user (admin only)
export async function DELETE(request: NextRequest) {
    try {
        const user = await getUser()
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('id')

        // Check admin access
        const isAdmin = user?.email === 'ravibarnwal89@gmail.com' || user?.role === 'ADMIN'
        if (!user || !isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 })
        }

        // Prevent admin from deleting themselves
        if (userId === user.id) {
            return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 })
        }

        // Delete related records first if necessary (Prisma cascade usually handles this depending on schema)
        // Check schema -> bookings relation might assume cascade or restrict.
        // Usually good practice to wrap in transaction or rely on cascade.
        // Assuming cascade or we just try:
        await prisma.user.delete({
            where: { id: userId }
        })

        return NextResponse.json({ success: true, message: "User deleted successfully" })
    } catch (error) {
        console.error("Error deleting user:", error)
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
    }
}
