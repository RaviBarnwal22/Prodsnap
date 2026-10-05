import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

const { getUser, prisma, createCashfreeOrder } = vi.hoisted(() => ({
    getUser: vi.fn(),
    prisma: {
        mentorshipBooking: { create: vi.fn() },
        subscriptionRequest: { create: vi.fn() },
    },
    createCashfreeOrder: vi.fn(),
}))
vi.mock("@/lib/auth", () => ({ getUser }))
vi.mock("@/lib/prisma", () => ({ prisma }))
vi.mock("@/lib/cashfree", () => ({ createCashfreeOrder }))
vi.mock("@/lib/analytics", () => ({ logEvent: vi.fn() }))

import { POST } from "@/app/api/payment/cashfree-order/route"

const post = (body: unknown) =>
    POST(new NextRequest("https://prodsnap.in/api/payment/cashfree-order", { method: "POST", body: JSON.stringify(body) }))

beforeEach(() => {
    vi.resetAllMocks()
    getUser.mockResolvedValue({ id: "u1", email: "u1@x.com", name: "U One" })
    prisma.mentorshipBooking.create.mockResolvedValue({ id: "b1" })
    createCashfreeOrder.mockResolvedValue({ payment_session_id: "sess" })
})

describe("POST /api/payment/cashfree-order", () => {
    it("requires sign-in", async () => {
        getUser.mockResolvedValue(null)
        expect((await post({ serviceType: "Resume Review" })).status).toBe(401)
        expect(createCashfreeOrder).not.toHaveBeenCalled()
    })

    it("charges the catalog price and ignores any amount the client sends", async () => {
        const res = await post({ type: "mentorship", serviceType: "PM Career Accelerator", amount: 1 })
        expect(res.status).toBe(200)
        expect(createCashfreeOrder.mock.calls[0][0].orderAmount).toBe(1299)
        expect(prisma.mentorshipBooking.create.mock.calls[0][0].data.amount).toBe(1299)
    })

    it.each(["Free Session", "toString", "__proto__", "constructor"])(
        "rejects unknown package %j without creating a booking or order",
        async (serviceType) => {
            const res = await post({ type: "mentorship", serviceType })
            expect(res.status).toBe(400)
            expect(prisma.mentorshipBooking.create).not.toHaveBeenCalled()
            expect(createCashfreeOrder).not.toHaveBeenCalled()
        }
    )
})
