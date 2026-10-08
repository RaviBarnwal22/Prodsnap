import Image from "next/image"
import Link from "next/link"
import { Clock } from "lucide-react"
import type { BlogCard as BlogCardData } from "@/lib/blog/queries"
import { formatBlogDate } from "./ArticleView"

export function BlogCard({ post, priority = false }: { post: BlogCardData; priority?: boolean }) {
    return (
        <Link href={`/blog/${post.slug}`} className="group flex flex-col overflow-hidden rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-xl hover:-translate-y-0.5 transition">
            <div className="relative aspect-[1200/630] bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/40 dark:to-indigo-900/40">
                {post.coverImage && (
                    <Image src={post.coverImage} alt={post.title} fill priority={priority} sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                )}
            </div>
            <div className="flex flex-1 flex-col p-5">
                {post.seriesName && (
                    <p className="text-[11px] font-black uppercase tracking-widest text-violet-600">
                        {post.seriesName}{post.seriesPart ? ` · Part ${post.seriesPart}` : ""}
                    </p>
                )}
                <h3 className="mt-1 text-lg font-black leading-snug text-gray-900 dark:text-white group-hover:text-violet-600 transition">{post.title}</h3>
                {post.excerpt && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{post.excerpt}</p>}
                <p className="mt-auto pt-4 flex items-center gap-3 text-xs text-gray-500">
                    <span>{formatBlogDate(post.publishedAt)}</span>
                    <span className="inline-flex items-center gap-1"><Clock size={12} />{post.readingMinutes} min</span>
                </p>
            </div>
        </Link>
    )
}
