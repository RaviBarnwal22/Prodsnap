import { prisma } from "@/lib/prisma"
import type { EditorPost } from "@/components/admin/blog/BlogEditor"

// Server-only helpers for the admin editor pages. Not a server action.

export async function getSeriesOptions(): Promise<string[]> {
    const rows = await prisma.blogPost.findMany({
        where: { seriesName: { not: null } },
        distinct: ["seriesName"],
        select: { seriesName: true },
        take: 100,
    })
    return rows.map((r) => r.seriesName!).filter(Boolean)
}

export async function getEditorPost(id: string): Promise<EditorPost | null> {
    const p = await prisma.blogPost.findUnique({
        where: { id },
        select: { id: true, title: true, slug: true, excerpt: true, coverImage: true, contentHtml: true, seriesName: true, seriesPart: true, tags: true, status: true },
    })
    if (!p) return null
    return { ...p, status: p.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT" }
}

export const EMPTY_POST: EditorPost = {
    id: null,
    title: "",
    slug: "",
    excerpt: "",
    coverImage: null,
    contentHtml: "",
    seriesName: null,
    seriesPart: null,
    tags: [],
    status: "DRAFT",
}
