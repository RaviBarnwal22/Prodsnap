import { describe, it, expect } from "vitest"
import { getMentorshipPrice, getMentorshipAiBonusMonths, MENTORSHIP_SERVICES, SESSION_FOCUS_OPTIONS, bookingServiceLabel, resolveMentorshipTitle } from "@/lib/constants"

describe("getMentorshipPrice", () => {
    it("returns the catalog price for every package", () => {
        expect(getMentorshipPrice("PM Career Accelerator")).toBe(1299)
        expect(getMentorshipPrice("Profile & Resume Booster")).toBe(899)
        expect(getMentorshipPrice("1:1 PM Career Session")).toBe(499)
    })

    // Renamed from "Resume Review" on 2026-10-11. Bookings saved under the old
    // name, and checkouts started before the deploy, must still resolve.
    it("still prices the old Resume Review name, at the same price", () => {
        expect(getMentorshipPrice("Resume Review")).toBe(499)
        expect(getMentorshipAiBonusMonths("Resume Review")).toBe(1)
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

// The single-session package lets the buyer pick a focus. The booking stores
// "<package> · <focus>", which must still resolve for the free AI month.
describe("session focus options", () => {
    it("offers exactly the three options", () => {
        expect(Object.keys(SESSION_FOCUS_OPTIONS)).toEqual(["Resume Review", "PM Career Guidance", "Career Roadmap"])
    })

    it("labels a booking with its focus", () => {
        expect(bookingServiceLabel("1:1 PM Career Session", "Career Roadmap")).toBe("1:1 PM Career Session · Career Roadmap")
        expect(bookingServiceLabel("1:1 PM Career Session", null)).toBe("1:1 PM Career Session")
    })

    it.each(Object.keys(SESSION_FOCUS_OPTIONS))("resolves a stored booking label with focus %s", (focus) => {
        const label = `1:1 PM Career Session · ${focus}`
        expect(resolveMentorshipTitle(label)).toBe("1:1 PM Career Session")
        expect(getMentorshipPrice(label)).toBe(499)
        expect(getMentorshipAiBonusMonths(label)).toBe(1)
    })

    it("rejects an unknown focus or a focus on a package that has none", () => {
        expect(resolveMentorshipTitle("1:1 PM Career Session · Hacking")).toBeNull()
        expect(resolveMentorshipTitle("PM Career Accelerator · Resume Review")).toBeNull()
        expect(resolveMentorshipTitle("1:1 PM Career Session · toString")).toBeNull()
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
