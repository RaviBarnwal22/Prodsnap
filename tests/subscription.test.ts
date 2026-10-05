import { describe, it, expect, vi, beforeEach } from "vitest"

const { getUser, prisma } = vi.hoisted(() => ({
    getUser: vi.fn(),
    prisma: {
        subscription: { findUnique: vi.fn(), update: vi.fn() },
        categoryAttempt: { findMany: vi.fn() },
    },
}))
vi.mock("@/lib/auth", () => ({ getUser }))
vi.mock("@/lib/prisma", () => ({ prisma }))

import { canAttemptCategory, hasActiveSubscription } from "@/lib/subscription"
import { FREE_ATTEMPT_LIMIT } from "@/lib/constants"

const DAY = 86_400_000
const attempts = (...counts: number[]) =>
    prisma.categoryAttempt.findMany.mockResolvedValue(counts.map((count) => ({ count })))

beforeEach(() => {
    vi.resetAllMocks()
    getUser.mockResolvedValue({ id: "u1" })
    prisma.subscription.findUnique.mockResolvedValue(null)
})

describe("canAttemptCategory", () => {
    it("blocks signed-out visitors", async () => {
        getUser.mockResolvedValue(null)
        expect((await canAttemptCategory("METRICS")).canAttempt).toBe(false)
    })

    it("allows a free user below the limit", async () => {
        attempts(FREE_ATTEMPT_LIMIT - 1)
        const r = await canAttemptCategory("METRICS")
        expect(r.canAttempt).toBe(true)
        expect(r.attemptsRemaining).toBe(1)
    })

    it("blocks a free user at or over the limit, never reporting negative remaining", async () => {
        attempts(FREE_ATTEMPT_LIMIT + 3)
        const r = await canAttemptCategory("METRICS")
        expect(r.canAttempt).toBe(false)
        expect(r.attemptsRemaining).toBe(0)
    })

    it("counts attempts across all categories, so switching category does not reset the limit", async () => {
        attempts(FREE_ATTEMPT_LIMIT - 2, 1, 1)
        expect((await canAttemptCategory("RCA")).canAttempt).toBe(false)
    })

    it("gives an active subscriber unlimited attempts", async () => {
        prisma.subscription.findUnique.mockResolvedValue({ status: "active", endDate: new Date(Date.now() + DAY) })
        attempts(100)
        const r = await canAttemptCategory("METRICS")
        expect(r.canAttempt).toBe(true)
        expect(r.isPremium).toBe(true)
    })
})

describe("hasActiveSubscription", () => {
    it("treats an expired plan as inactive and marks it so", async () => {
        prisma.subscription.findUnique.mockResolvedValue({ status: "active", endDate: new Date(Date.now() - 1000) })
        expect(await hasActiveSubscription()).toBe(false)
        expect(prisma.subscription.update).toHaveBeenCalledWith({ where: { userId: "u1" }, data: { status: "inactive" } })
    })

    it("treats a non-active status as inactive even with a future end date", async () => {
        prisma.subscription.findUnique.mockResolvedValue({ status: "inactive", endDate: new Date(Date.now() + DAY) })
        expect(await hasActiveSubscription()).toBe(false)
    })
})
