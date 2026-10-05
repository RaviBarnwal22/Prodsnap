import { describe, it, expect, vi, beforeEach } from "vitest"

const { prisma } = vi.hoisted(() => ({
    prisma: {
        user: { findUnique: vi.fn() },
        subscription: { findUnique: vi.fn(), upsert: vi.fn() },
    },
}))
vi.mock("@/lib/prisma", () => ({ prisma }))

import { grantAiAccessBonus } from "@/lib/ai-bonus"

const DAY = 86_400_000
const grantedEndDate = () => prisma.subscription.upsert.mock.calls[0][0].update.endDate as Date

beforeEach(() => {
    vi.resetAllMocks()
    prisma.user.findUnique.mockResolvedValue({ id: "u1" })
    prisma.subscription.findUnique.mockResolvedValue(null)
})

describe("grantAiAccessBonus", () => {
    it("starts a one-month plan for a user with none", async () => {
        await grantAiAccessBonus("u1", "a@b.com", "Resume Review")
        const daysGranted = (grantedEndDate().getTime() - Date.now()) / DAY
        expect(daysGranted).toBeGreaterThan(27)
        expect(daysGranted).toBeLessThan(32)
    })

    it("extends an active plan from its end date instead of shortening it", async () => {
        const existingEnd = new Date(Date.now() + 60 * DAY)
        prisma.subscription.findUnique.mockResolvedValue({ status: "active", endDate: existingEnd })
        await grantAiAccessBonus("u1", "a@b.com", "Resume Review")
        expect(grantedEndDate().getTime()).toBeGreaterThan(existingEnd.getTime() + 27 * DAY)
    })

    it("restarts from today when the old plan already expired", async () => {
        prisma.subscription.findUnique.mockResolvedValue({ status: "inactive", endDate: new Date(Date.now() - 90 * DAY) })
        await grantAiAccessBonus("u1", "a@b.com", "Resume Review")
        expect((grantedEndDate().getTime() - Date.now()) / DAY).toBeGreaterThan(27)
    })

    it("resolves the account by booking user id before the editable contact email", async () => {
        await grantAiAccessBonus("u1", "typed-by-user@x.com", "Resume Review")
        expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: "u1" } })
    })

    it("grants nothing for an unknown package", async () => {
        await grantAiAccessBonus("u1", "a@b.com", "toString")
        expect(prisma.subscription.upsert).not.toHaveBeenCalled()
    })

    it("grants nothing when no account matches", async () => {
        prisma.user.findUnique.mockResolvedValue(null)
        await grantAiAccessBonus(null, "nobody@x.com", "Resume Review")
        expect(prisma.subscription.upsert).not.toHaveBeenCalled()
    })
})
