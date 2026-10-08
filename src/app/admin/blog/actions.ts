'use server'

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getUser, isOwner } from "@/lib/auth"
import { sanitizeBlogHtml, slugify, readingMinutes, htmlToText } from "@/lib/blog/content"

// Every export here is a public HTTP endpoint, so each one checks for the
// owner itself. The admin layout only protects the page, not these.
async function assertOwner() {
    const user = await getUser()
    if (!isOwner(user)) throw new Error("Unauthorized")
}

const MAX_TITLE = 160
const MAX_EXCERPT = 300
const MAX_HTML = 300_000
const MAX_SERIES = 80
const MAX_TAGS = 8

export type BlogPostInput = {
    title: string
    slug?: string
    excerpt?: string
    coverImage?: string | null
    contentHtml: string
    seriesName?: string | null
    seriesPart?: number | null
    tags?: string[]
}

export type SaveResult = { ok: true; id: string; slug: string } | { ok: false; error: string }

function clean(input: BlogPostInput) {
    const title = String(input.title ?? "").trim().slice(0, MAX_TITLE)
    const contentHtml = sanitizeBlogHtml(String(input.contentHtml ?? "").slice(0, MAX_HTML))
    const slug = slugify(input.slug?.trim() || title)
    const excerpt =
        String(input.excerpt ?? "").trim().slice(0, MAX_EXCERPT) ||
        htmlToText(contentHtml).slice(0, 200)
    const cover = String(input.coverImage ?? "").trim()
    const coverImage = /^https:\/\/\S+$/i.test(cover) && cover.length <= 500 ? cover : null
    const seriesName = String(input.seriesName ?? "").trim().slice(0, MAX_SERIES) || null
    const part = Number(input.seriesPart)
    const seriesPart = seriesName && Number.isInteger(part) && part > 0 && part < 1000 ? part : null
    const tags = Array.from(
        new Set((input.tags ?? []).map((t) => String(t).trim().toLowerCase().slice(0, 30)).filter(Boolean))
    ).slice(0, MAX_TAGS)
    return { title, slug, excerpt, coverImage, contentHtml, seriesName, seriesPart, tags, readingMinutes: readingMinutes(contentHtml) }
}

function refreshPublicPages(slug?: string) {
    revalidatePath("/blog")
    if (slug) revalidatePath(`/blog/${slug}`)
    revalidatePath("/community")
    revalidatePath("/sitemap.xml")
}

/** Create (no id) or update a post. Never changes its published state. */
export async function saveBlogPost(id: string | null, input: BlogPostInput): Promise<SaveResult> {
    await assertOwner()
    const data = clean(input)
    if (!data.title) return { ok: false, error: "Add a title first." }
    if (!data.slug) return { ok: false, error: "The title needs at least one letter or number for the URL." }

    const clash = await prisma.blogPost.findUnique({ where: { slug: data.slug }, select: { id: true } })
    if (clash && clash.id !== id) return { ok: false, error: `Another article already uses the URL /blog/${data.slug}. Change the URL slug.` }

    if (id) {
        const before = await prisma.blogPost.findUnique({ where: { id }, select: { slug: true, status: true } })
        if (!before) return { ok: false, error: "That article no longer exists." }
        const post = await prisma.blogPost.update({ where: { id }, data, select: { id: true, slug: true } })
        if (before.status === "PUBLISHED") {
            refreshPublicPages(post.slug)
            if (before.slug !== post.slug) revalidatePath(`/blog/${before.slug}`)
        }
        revalidatePath("/admin/blog")
        return { ok: true, id: post.id, slug: post.slug }
    }

    const post = await prisma.blogPost.create({ data, select: { id: true, slug: true } })
    revalidatePath("/admin/blog")
    return { ok: true, id: post.id, slug: post.slug }
}

export async function setBlogPostPublished(id: string, published: boolean): Promise<SaveResult> {
    await assertOwner()
    const post = await prisma.blogPost.findUnique({ where: { id }, select: { id: true, slug: true, title: true, contentHtml: true, publishedAt: true } })
    if (!post) return { ok: false, error: "That article no longer exists." }
    if (published && (!post.title || !htmlToText(post.contentHtml))) {
        return { ok: false, error: "Add a title and some text before publishing." }
    }
    await prisma.blogPost.update({
        where: { id },
        data: published
            ? { status: "PUBLISHED", publishedAt: post.publishedAt ?? new Date() }
            : { status: "DRAFT" },
    })
    refreshPublicPages(post.slug)
    revalidatePath("/admin/blog")
    return { ok: true, id: post.id, slug: post.slug }
}

export async function deleteBlogPost(id: string): Promise<{ ok: boolean; error?: string }> {
    await assertOwner()
    const post = await prisma.blogPost.findUnique({ where: { id }, select: { slug: true } })
    if (!post) return { ok: false, error: "That article no longer exists." }
    await prisma.blogPost.delete({ where: { id } })
    refreshPublicPages(post.slug)
    revalidatePath("/admin/blog")
    return { ok: true }
}
