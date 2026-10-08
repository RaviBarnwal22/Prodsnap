import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Breadcrumbs } from "@/components/Breadcrumbs"
import { ArticleView } from "@/components/blog/ArticleView"
import { BlogCard } from "@/components/blog/BlogCard"
import { getPublishedPost, getSeriesPosts, getRecentPosts } from "@/lib/blog/queries"
import { Linkedin } from "lucide-react"

export const revalidate = 3600

// Empty on purpose: articles render on first visit and are then cached, so a
// build never depends on the database. Publishing revalidates the page.
export function generateStaticParams() {
    return []
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const post = await getPublishedPost(slug)
    if (!post) return { title: "Article not found | Prodsnap", robots: { index: false } }

    const url = `https://prodsnap.in/blog/${post.slug}`
    const images = post.coverImage ? [{ url: post.coverImage, width: 1200, height: 630, alt: post.title }] : undefined
    return {
        title: `${post.title} | Prodsnap Blog`,
        description: post.excerpt,
        alternates: { canonical: `/blog/${post.slug}` },
        authors: [{ name: "Ravi Barnwal", url: "https://www.linkedin.com/in/barnwalravi/" }],
        keywords: post.tags,
        openGraph: {
            type: "article",
            url,
            title: post.title,
            description: post.excerpt,
            siteName: "Prodsnap",
            publishedTime: post.publishedAt?.toISOString(),
            modifiedTime: post.updatedAt.toISOString(),
            authors: ["Ravi Barnwal"],
            tags: post.tags,
            ...(images ? { images } : {}),
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.excerpt,
            ...(post.coverImage ? { images: [post.coverImage] } : {}),
        },
    }
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params
    const post = await getPublishedPost(slug)
    if (!post) notFound()

    const [series, recent] = await Promise.all([
        post.seriesName ? getSeriesPosts(post.seriesName) : Promise.resolve([]),
        getRecentPosts(post.slug),
    ])

    const url = `https://prodsnap.in/blog/${post.slug}`
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt,
        ...(post.coverImage ? { image: [post.coverImage] } : {}),
        datePublished: post.publishedAt?.toISOString(),
        dateModified: post.updatedAt.toISOString(),
        author: { "@type": "Person", name: "Ravi Barnwal", url: "https://www.linkedin.com/in/barnwalravi/" },
        publisher: { "@type": "Organization", name: "Prodsnap", logo: { "@type": "ImageObject", url: "https://prodsnap.in/logo.png" } },
        mainEntityOfPage: url,
        keywords: post.tags.join(", "),
        ...(post.seriesName ? { isPartOf: { "@type": "CreativeWorkSeries", name: post.seriesName } } : {}),
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
            <Header />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
            <main className="flex-grow px-4 pt-8 pb-20">
                <div className="max-w-3xl mx-auto mb-6">
                    <Breadcrumbs items={[{ label: "Blog", href: "/blog" }, { label: post.title, href: `/blog/${post.slug}` }]} />
                </div>

                <ArticleView post={post} series={series} />

                <div className="max-w-3xl mx-auto mt-10 flex items-center justify-between gap-4 border-t border-gray-100 dark:border-gray-800 pt-6">
                    <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Found this useful? Share it with your network.</p>
                    <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#0a66c2] px-4 py-2 text-sm font-bold text-white hover:bg-[#004182]"
                    >
                        <Linkedin size={16} /> Share
                    </a>
                </div>

                {recent.length > 0 && (
                    <section className="max-w-6xl mx-auto mt-16">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Keep reading</h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recent.map((p) => <BlogCard key={p.slug} post={p} />)}
                        </div>
                    </section>
                )}
            </main>
            <Footer />
        </div>
    )
}
