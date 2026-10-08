import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { BlogCard } from "@/components/blog/BlogCard"
import { getPublishedPosts } from "@/lib/blog/queries"
import { ArrowRight } from "lucide-react"

// Rebuilt at most hourly, and immediately whenever an article is published,
// edited or removed (the admin actions call revalidatePath).
export const revalidate = 3600

const title = "AI Product Management Blog | Prodsnap"
const description = "Long-form articles on AI product management, PM interviews and building AI products, written by Ravi Barnwal. Practical frameworks you can use in your next interview."

export const metadata: Metadata = {
    title,
    description,
    alternates: { canonical: "/blog" },
    openGraph: { type: "website", url: "https://prodsnap.in/blog", title, description },
}

export default async function BlogIndexPage() {
    const posts = await getPublishedPosts()
    const [lead, ...rest] = posts

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
            <Header />
            <main className="flex-grow">
                <section className="bg-gradient-to-b from-violet-50 to-white dark:from-gray-900 dark:to-gray-950 px-4 pt-16 pb-10">
                    <div className="max-w-6xl mx-auto">
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-violet-600">The Prodsnap Blog</p>
                        <h1 className="mt-3 text-4xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-white">AI product management, explained</h1>
                        <p className="mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
                            In-depth articles on building AI products and cracking PM interviews, from a product manager who does both.
                        </p>
                    </div>
                </section>

                <section className="px-4 pb-20">
                    <div className="max-w-6xl mx-auto">
                        {posts.length === 0 ? (
                            <div className="rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
                                <p className="text-xl font-black text-gray-900 dark:text-white">The first article is on its way</p>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">Meanwhile, put your PM skills to the test on a real case.</p>
                                <Link href="/practice" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white hover:bg-violet-700">
                                    Try a free case <ArrowRight size={16} />
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="grid md:grid-cols-[3fr_2fr] gap-6 mb-10">
                                    <BlogCard post={lead} priority />
                                    {rest[0] && <BlogCard post={rest[0]} />}
                                </div>
                                {rest.length > 1 && (
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {rest.slice(1).map((p) => <BlogCard key={p.slug} post={p} />)}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}
