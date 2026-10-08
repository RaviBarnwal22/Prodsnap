import Image from "next/image"
import Link from "next/link"
import { CalendarDays, Clock, Layers } from "lucide-react"
import { sanitizeBlogHtml, splitByCta } from "@/lib/blog/content"
import { BlogCtaCard } from "./BlogCtaCard"

export type ArticleViewPost = {
    slug: string
    title: string
    excerpt: string
    coverImage: string | null
    contentHtml: string
    seriesName: string | null
    seriesPart: number | null
    tags: string[]
    readingMinutes: number
    publishedAt: Date | null
}

export function formatBlogDate(d: Date | null) {
    return d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Draft"
}

/**
 * The article itself: header, cover and body with CTA cards in place.
 * Used by the live page and the admin preview, so a preview is exact.
 */
export function ArticleView({
    post,
    series = [],
    tracked = true,
}: {
    post: ArticleViewPost
    series?: { slug: string; title: string; seriesPart: number | null }[]
    tracked?: boolean
}) {
    // Sanitized again at render: defence in depth if a row was edited directly.
    const segments = splitByCta(sanitizeBlogHtml(post.contentHtml))

    return (
        <article className="max-w-3xl mx-auto">
            <header className="mb-8">
                {post.seriesName && (
                    <p className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 dark:bg-violet-900/30 px-3 py-1 text-xs font-black uppercase tracking-widest text-violet-700 dark:text-violet-300">
                        <Layers size={13} /> {post.seriesName}{post.seriesPart ? ` · Part ${post.seriesPart}` : ""}
                    </p>
                )}
                <h1 className="mt-4 text-3xl md:text-5xl font-black tracking-tight leading-[1.1] text-gray-900 dark:text-white">{post.title}</h1>
                {post.excerpt && <p className="mt-4 text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">{post.excerpt}</p>}
                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
                    <span className="font-bold text-gray-900 dark:text-gray-100">Ravi Barnwal</span>
                    <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} />{formatBlogDate(post.publishedAt)}</span>
                    <span className="inline-flex items-center gap-1.5"><Clock size={14} />{post.readingMinutes} min read</span>
                </div>
            </header>

            {post.coverImage && (
                <div className="relative mb-10 aspect-[1200/630] overflow-hidden rounded-3xl bg-gray-100">
                    <Image src={post.coverImage} alt={post.title} fill priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
                </div>
            )}

            <div className="blog-prose">
                {segments.map((s, i) =>
                    s.kind === "html"
                        ? <div key={i} dangerouslySetInnerHTML={{ __html: s.html }} />
                        : <BlogCtaCard key={i} cta={s.cta} tracked={tracked} />
                )}
            </div>

            {post.tags.length > 0 && (
                <div className="mt-10 flex flex-wrap gap-2">
                    {post.tags.map((t) => (
                        <span key={t} className="rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs font-bold text-gray-600 dark:text-gray-300">#{t}</span>
                    ))}
                </div>
            )}

            {series.length > 1 && (
                <nav aria-label={`${post.seriesName} series`} className="mt-12 rounded-3xl border border-gray-200 dark:border-gray-800 p-6">
                    <p className="text-xs font-black uppercase tracking-widest text-violet-600">The {post.seriesName} series</p>
                    <ol className="mt-3 space-y-2">
                        {series.map((p, i) => (
                            <li key={p.slug} className="flex gap-3 text-sm">
                                <span className="w-6 shrink-0 font-black text-gray-400">{p.seriesPart ?? i + 1}</span>
                                {p.slug === post.slug
                                    ? <span className="font-bold text-gray-900 dark:text-white">{p.title} <span className="text-violet-600">(you&apos;re here)</span></span>
                                    : <Link href={`/blog/${p.slug}`} className="text-gray-600 dark:text-gray-300 hover:text-violet-600 hover:underline">{p.title}</Link>}
                            </li>
                        ))}
                    </ol>
                </nav>
            )}
        </article>
    )
}
