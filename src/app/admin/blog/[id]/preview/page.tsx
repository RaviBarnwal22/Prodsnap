import { notFound, redirect } from "next/navigation"
import type { Metadata } from "next"
import { getUser, isOwner } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { ArticleView } from "@/components/blog/ArticleView"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Preview | Prodsnap Admin", robots: { index: false, follow: false } }

// Shows the last saved version exactly as readers will see it, drafts included.
export default async function BlogPreviewPage({ params }: { params: Promise<{ id: string }> }) {
    const user = await getUser()
    if (!isOwner(user)) redirect("/admin/login")
    const { id } = await params
    const post = await prisma.blogPost.findUnique({ where: { id } })
    if (!post) notFound()

    const series = post.seriesName
        ? await prisma.blogPost.findMany({
            where: { seriesName: post.seriesName, OR: [{ status: "PUBLISHED" }, { id: post.id }] },
            orderBy: [{ seriesPart: "asc" }, { publishedAt: "asc" }],
            take: 50,
            select: { slug: true, title: true, seriesPart: true },
        })
        : []

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
            <div className="bg-amber-400 text-amber-950 text-center text-sm font-bold py-2">
                Preview of the last saved version · {post.status === "PUBLISHED" ? "This article is live" : "Draft, not visible to readers"}
            </div>
            <Header />
            <main className="flex-grow px-4 pt-10 pb-20">
                <ArticleView post={post} series={series} tracked={false} />
            </main>
            <Footer />
        </div>
    )
}
