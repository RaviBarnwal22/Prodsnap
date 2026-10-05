import { describe, it, expect } from "vitest"
import { getMentorshipPrice, getMentorshipAiBonusMonths, MENTORSHIP_SERVICES } from "@/lib/constants"

describe("getMentorshipPrice", () => {
    it("returns the catalog price for every package", () => {
        expect(getMentorshipPrice("PM Career Accelerator")).toBe(1299)
        expect(getMentorshipPrice("Profile & Resume Booster")).toBe(899)
        expect(getMentorshipPrice("Resume Review")).toBe(499)
    })

    it("returns null for an unknown package", () => {
        expect(getMentorshipPrice("Free Session")).toBeNull()
        expect(getMentorshipPrice("")).toBeNull()
        expect(getMentorshipPrice("resume review")).toBeNull()
    })

    // serviceType comes straight from the request body. Property names
    // inherited from Object.prototype must not be treated as packages.
    it.each(["toString", "constructor", "__proto__", "hasOwnProperty", "valueOf"])(
        "returns null for the inherited property name %s",
        (name) => {
            expect(getMentorshipPrice(name)).toBeNull()
        }
    )

    it("only ever returns a positive whole-rupee amount", () => {
        for (const name of Object.keys(MENTORSHIP_SERVICES)) {
            const price = getMentorshipPrice(name)
            expect(Number.isInteger(price)).toBe(true)
            expect(price!).toBeGreaterThan(0)
        }
    })
})

describe("getMentorshipAiBonusMonths", () => {
    it("grants one month with every package", () => {
        for (const name of Object.keys(MENTORSHIP_SERVICES)) {
            expect(getMentorshipAiBonusMonths(name)).toBe(1)
        }
    })

    it.each(["Unknown", "toString", "__proto__", "constructor"])("grants nothing for %s", (name) => {
        expect(getMentorshipAiBonusMonths(name)).toBe(0)
    })
})
