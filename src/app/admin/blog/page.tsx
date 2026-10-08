import Link from "next/link"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { getUser, isOwner } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { BLOG_CTAS, isBlogCtaType } from "@/lib/blog/cta"
import { formatBlogDate } from "@/components/blog/ArticleView"
import { ArrowLeft, Eye, Linkedin, MousePointerClick, PenSquare, Plus } from "lucide-react"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Blog | Prodsnap Admin", robots: { index: false } }

export default async function AdminBlogPage() {
    const user = await getUser()
    if (!isOwner(user)) redirect("/admin/login")

    const [posts, views, linkedinViews, clicks] = await Promise.all([
        prisma.blogPost.findMany({
            orderBy: [{ updatedAt: "desc" }],
            take: 200,
            select: { id: true, slug: true, title: true, status: true, seriesName: true, seriesPart: true, publishedAt: true, updatedAt: true, coverImage: true },
        }),
        prisma.userActivity.groupBy({ by: ["page"], where: { action: "view", page: { startsWith: "/blog/" } }, _count: { _all: true } }),
        prisma.userActivity.groupBy({ by: ["page"], where: { action: "view", page: { startsWith: "/blog/" }, metadata: "linkedin" }, _count: { _all: true } }),
        prisma.userActivity.groupBy({ by: ["page", "metadata"], where: { action: "blog_cta_click", page: { startsWith: "/blog/" } }, _count: { _all: true } }),
    ])

    const viewsBy = new Map(views.map((v) => [v.page, v._count._all]))
    const linkedinBy = new Map(linkedinViews.map((v) => [v.page, v._count._all]))
    const clicksBy = new Map<string, { total: number; byType: Record<string, number> }>()
    for (const c of clicks) {
        const entry = clicksBy.get(c.page) ?? { total: 0, byType: {} }
        entry.total += c._count._all
        const key = c.metadata ?? "other"
        entry.byType[key] = (entry.byType[key] ?? 0) + c._count._all
        clicksBy.set(c.page, entry)
    }

    const published = posts.filter((p) => p.status === "PUBLISHED").length
    const totalViews = posts.reduce((n, p) => n + (viewsBy.get(`/blog/${p.slug}`) ?? 0), 0)
    const totalClicks = posts.reduce((n, p) => n + (clicksBy.get(`/blog/${p.slug}`)?.total ?? 0), 0)

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <header className="border-b border-gray-800 bg-gray-950">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
                    <Link href="/admin" className="flex items-center gap-1.5 text-sm font-bold text-gray-400 hover:text-white"><ArrowLeft size={16} /> Admin</Link>
                    <h1 className="text-lg font-black">Blog</h1>
                    <span className="flex-1" />
                    <Link href="/blog" target="_blank" className="text-sm font-bold text-gray-400 hover:text-white">View blog</Link>
                    <Link href="/admin/blog/new" className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold hover:bg-violet-700">
                        <Plus size={16} /> New article
                    </Link>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: "Published", value: published, sub: `${posts.length - published} drafts` },
                        { label: "Article views", value: totalViews, sub: "all time" },
                        { label: "CTA clicks", value: totalClicks, sub: totalViews ? `${((totalClicks / totalViews) * 100).toFixed(1)}% of views` : "no views yet" },
                    ].map((s) => (
                        <div key={s.label} className="rounded-2xl border border-gray-800 bg-gray-950 p-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{s.label}</p>
                            <p className="mt-1 text-3xl font-black">{s.value}</p>
                            <p className="text-xs text-gray-500">{s.sub}</p>
                        </div>
                    ))}
                </div>

                {posts.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-700 p-12 text-center">
                        <p className="text-lg font-black">No articles yet</p>
                        <p className="mt-1 text-sm text-gray-400">Write your first one. It stays a draft until you publish.</p>
                        <Link href="/admin/blog/new" className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold hover:bg-violet-700"><Plus size={16} /> New article</Link>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-gray-800">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-950 text-left text-xs uppercase tracking-widest text-gray-500">
                                <tr>
                                    <th className="px-4 py-3">Article</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right"><Eye size={14} className="inline" /> Views</th>
                                    <th className="px-4 py-3 text-right"><Linkedin size={14} className="inline" /> From LinkedIn</th>
                                    <th className="px-4 py-3 text-right"><MousePointerClick size={14} className="inline" /> CTA clicks</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {posts.map((p) => {
                                    const page = `/blog/${p.slug}`
                                    const c = clicksBy.get(page)
                                    return (
                                        <tr key={p.id} className="hover:bg-gray-800/40">
                                            <td className="px-4 py-3">
                                                <Link href={`/admin/blog/${p.id}`} className="font-bold hover:text-violet-400">{p.title || "Untitled"}</Link>
                                                <p className="text-xs text-gray-500">
                                                    {p.seriesName ? `${p.seriesName}${p.seriesPart ? ` · Part ${p.seriesPart}` : ""} · ` : ""}
                                                    {p.status === "PUBLISHED" ? `Published ${formatBlogDate(p.publishedAt)}` : `Edited ${formatBlogDate(p.updatedAt)}`}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`rounded-md px-2 py-1 text-[11px] font-black uppercase tracking-widest ${p.status === "PUBLISHED" ? "bg-emerald-500/15 text-emerald-400" : "bg-gray-700 text-gray-300"}`}>
                                                    {p.status === "PUBLISHED" ? "Live" : "Draft"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold">{viewsBy.get(page) ?? 0}</td>
                                            <td className="px-4 py-3 text-right">{linkedinBy.get(page) ?? 0}</td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="font-bold">{c?.total ?? 0}</span>
                                                {c && (
                                                    <p className="text-[11px] text-gray-500">
                                                        {Object.entries(c.byType).map(([t, n]) => `${isBlogCtaType(t) ? BLOG_CTAS[t].label : t} ${n}`).join(" · ")}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Link href={`/admin/blog/${p.id}`} className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 font-bold"><PenSquare size={14} /> Edit</Link>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                <p className="text-xs text-gray-500">
                    Views count page loads from the site&apos;s own tracker, so they include visitors with ad blockers. &quot;From LinkedIn&quot; counts visits through the tracked link from the editor, or with LinkedIn as the referrer.
                </p>
            </main>
        </div>
    )
}
