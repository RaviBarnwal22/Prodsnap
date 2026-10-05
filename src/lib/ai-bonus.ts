import { prisma } from "@/lib/prisma"
import { getMentorshipAiBonusMonths } from "@/lib/constants"

// Bundled perk: every paid mentorship package includes Prodsnap AI access.
// The number of months comes from the server-side catalog, never the client.
export async function grantAiAccessBonus(userId: string | null, email: string, serviceType: string) {
    const months = getMentorshipAiBonusMonths(serviceType)
    if (months <= 0) return

    // Prefer the account that made the booking: the contact email on the form is
    // editable, so it may not be the address the user signed in with.
    const user = userId
        ? await prisma.user.findUnique({ where: { id: userId } })
        : await prisma.user.findUnique({ where: { email } })

    if (!user) {
        console.warn(`[AI Bonus] No Prodsnap account for booking (${email}); ${months} month(s) not granted`)
        return
    }

    const existing = await prisma.subscription.findUnique({ where: { userId: user.id } })
    const now = new Date()
    // Extend from whichever is later, so an already-active plan is never shortened
    const base = existing?.endDate && existing.endDate > now ? existing.endDate : now
    const endDate = new Date(base)
    endDate.setMonth(endDate.getMonth() + months)

    await prisma.subscription.upsert({
        where: { userId: user.id },
        update: { status: 'active', endDate },
        create: {
            userId: user.id,
            status: 'active',
            planType: 'mentorship_bonus',
            priceINR: 0,
            startDate: now,
            endDate
        }
    })
}
