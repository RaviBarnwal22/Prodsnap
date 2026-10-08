import { describe, it, expect, vi, beforeEach } from "vitest"

const { getUser, prisma } = vi.hoisted(() => ({
    getUser: vi.fn(),
    prisma: {
        blogPost: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    },
}))
vi.mock("@/lib/auth", async () => {
    const real = await vi.importActual<typeof import("@/lib/auth")>("@/lib/auth")
    return { ...real, getUser }
})
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }))
vi.mock("@/lib/prisma", () => ({ prisma }))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))

import { saveBlogPost, setBlogPostPublished, deleteBlogPost } from "@/app/admin/blog/actions"

const OWNER = { id: "o1", email: "ravibarnwal89@gmail.com", role: "STUDENT" }
const input = { title: "Evals for AI PMs", contentHtml: "<p>Hello</p>" }

beforeEach(() => {
    vi.resetAllMocks()
    getUser.mockResolvedValue(OWNER)
    prisma.blogPost.findUnique.mockResolvedValue(null)
    prisma.blogPost.create.mockImplementation(async ({ data }) => ({ id: "p1", slug: data.slug }))
    prisma.blogPost.update.mockImplementation(async ({ data }) => ({ id: "p1", slug: data.slug ?? "s" }))
})

describe("blog admin actions: authorization", () => {
    it.each([
        ["signed out", null],
        ["a student", { id: "u1", email: "student@x.com", role: "STUDENT" }],
        ["a role-ADMIN account that is not the owner", { id: "u2", email: "helper@x.com", role: "ADMIN" }],
    ])("rejects %s on every action", async (_label, user) => {
        getUser.mockResolvedValue(user)
        await expect(saveBlogPost(null, input)).rejects.toThrow("Unauthorized")
        await expect(setBlogPostPublished("p1", true)).rejects.toThrow("Unauthorized")
        await expect(deleteBlogPost("p1")).rejects.toThrow("Unauthorized")
        expect(prisma.blogPost.create).not.toHaveBeenCalled()
        expect(prisma.blogPost.update).not.toHaveBeenCalled()
        expect(prisma.blogPost.delete).not.toHaveBeenCalled()
    })
})

describe("saveBlogPost", () => {
    it("creates a draft with a slug from the title", async () => {
        const res = await saveBlogPost(null, input)
        expect(res).toEqual({ ok: true, id: "p1", slug: "evals-for-ai-pms" })
        const data = prisma.blogPost.create.mock.calls[0][0].data
        expect(data).not.toHaveProperty("status")
        expect(data.readingMinutes).toBe(1)
    })

    it("sanitizes the HTML before storing it", async () => {
        await saveBlogPost(null, { title: "T", contentHtml: '<p onclick="x()">a</p><script>alert(1)</script>' })
        const html = prisma.blogPost.create.mock.calls[0][0].data.contentHtml
        expect(html).toBe("<p>a</p>")
    })

    it("bounds and cleans every field", async () => {
        await saveBlogPost(null, {
            title: "x".repeat(500),
            contentHtml: "<p>a</p>",
            excerpt: "e".repeat(1000),
            coverImage: "javascript:alert(1)",
            seriesName: "  AI for PMs  ",
            seriesPart: -3,
            tags: ["AI", "ai", " Evals ", ...Array.from({ length: 20 }, (_, i) => `t${i}`)],
        })
        const d = prisma.blogPost.create.mock.calls[0][0].data
        expect(d.title.length).toBe(160)
        expect(d.excerpt.length).toBe(300)
        expect(d.coverImage).toBeNull()
        expect(d.seriesName).toBe("AI for PMs")
        expect(d.seriesPart).toBeNull()
        expect(d.tags).toEqual(["ai", "evals", "t0", "t1", "t2", "t3", "t4", "t5"])
    })

    it("falls back to the opening text when the summary is empty", async () => {
        await saveBlogPost(null, { title: "T", contentHtml: "<h2>Intro</h2><p>Evals decide whether you ship.</p>" })
        expect(prisma.blogPost.create.mock.calls[0][0].data.excerpt).toBe("Intro Evals decide whether you ship.")
    })

    it("refuses a title with no letters or numbers", async () => {
        expect(await saveBlogPost(null, { title: "!!!", contentHtml: "<p>a</p>" })).toMatchObject({ ok: false })
        expect(await saveBlogPost(null, { title: "   ", contentHtml: "<p>a</p>" })).toMatchObject({ ok: false })
    })

    it("refuses a URL another article already uses", async () => {
        prisma.blogPost.findUnique.mockResolvedValueOnce({ id: "other" })
        const res = await saveBlogPost(null, input)
        expect(res.ok).toBe(false)
        expect(prisma.blogPost.create).not.toHaveBeenCalled()
    })
})

describe("setBlogPostPublished", () => {
    it("will not publish an article with no text", async () => {
        prisma.blogPost.findUnique.mockResolvedValue({ id: "p1", slug: "s", title: "T", contentHtml: "<p> </p>", publishedAt: null })
        expect((await setBlogPostPublished("p1", true)).ok).toBe(false)
        expect(prisma.blogPost.update).not.toHaveBeenCalled()
    })

    it("keeps the original publish date when republishing", async () => {
        const first = new Date("2026-10-01")
        prisma.blogPost.findUnique.mockResolvedValue({ id: "p1", slug: "s", title: "T", contentHtml: "<p>a</p>", publishedAt: first })
        await setBlogPostPublished("p1", true)
        expect(prisma.blogPost.update.mock.calls[0][0].data).toEqual({ status: "PUBLISHED", publishedAt: first })
    })
})
