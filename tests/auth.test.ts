import { describe, it, expect, vi } from "vitest"

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }))
vi.mock("@/lib/prisma", () => ({ prisma: {} }))

const { isAdmin, isOwner } = await import("@/lib/auth")
const OWNER = "ravibarnwal89@gmail.com"

describe("isAdmin", () => {
    it("admits the owner email and role ADMIN", () => {
        expect(isAdmin({ email: OWNER, role: "STUDENT" })).toBe(true)
        expect(isAdmin({ email: "someone@else.com", role: "ADMIN" })).toBe(true)
    })

    it("rejects students, missing users and look-alike values", () => {
        expect(isAdmin({ email: "student@gmail.com", role: "STUDENT" })).toBe(false)
        expect(isAdmin(null)).toBe(false)
        expect(isAdmin(undefined)).toBe(false)
        expect(isAdmin({ email: OWNER.toUpperCase(), role: "STUDENT" })).toBe(false)
        expect(isAdmin({ email: ` ${OWNER}`, role: "STUDENT" })).toBe(false)
        expect(isAdmin({ email: "student@gmail.com", role: "admin" })).toBe(false)
    })
})

describe("isOwner", () => {
    it("admits only the owner email, not role ADMIN", () => {
        expect(isOwner({ email: OWNER })).toBe(true)
        expect(isOwner({ email: "someone@else.com", role: "ADMIN" } as { email: string })).toBe(false)
        expect(isOwner(null)).toBe(false)
    })
})
