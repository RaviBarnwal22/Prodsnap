import { prisma } from "@/lib/prisma"

// Read helpers for the public blog. Plain server module, not a server action,
// so none of these are callable from the browser.

const cardSelect = {
    slug: true,
    title: true,
    excerpt: true,
    coverImage: true,
    seriesName: true,
    seriesPart: true,
    tags: true,
    readingMinutes: true,
    publishedAt: true,
} as const

export async function getPublishedPosts(take = 60) {
    return prisma.blogPost.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take,
        select: cardSelect,
    })
}

export async function getPublishedPost(slug: string) {
    if (!slug || slug.length > 100) return null
    return prisma.blogPost.findFirst({
        where: { slug, status: "PUBLISHED" },
        select: { ...cardSelect, id: true, contentHtml: true, updatedAt: true },
    })
}

/** Other parts of the same series, in order, for the series navigator. */
export async function getSeriesPosts(seriesName: string) {
    return prisma.blogPost.findMany({
        where: { status: "PUBLISHED", seriesName },
        orderBy: [{ seriesPart: "asc" }, { publishedAt: "asc" }],
        take: 50,
        select: { slug: true, title: true, seriesPart: true },
    })
}

export async function getRecentPosts(excludeSlug: string, take = 3) {
    return prisma.blogPost.findMany({
        where: { status: "PUBLISHED", slug: { not: excludeSlug } },
        orderBy: { publishedAt: "desc" },
        take,
        select: cardSelect,
    })
}

export type BlogCard = Awaited<ReturnType<typeof getPublishedPosts>>[number]
