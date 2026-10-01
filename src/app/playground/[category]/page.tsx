import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { PLAYGROUND_CATEGORIES, getPlaygroundCategory } from '@/lib/playground/categories'
import { getCategoryData, getSectionOrder } from '@/lib/playground/content'
import { CategoryGame } from './CategoryGame'

export function generateStaticParams() {
    return PLAYGROUND_CATEGORIES.map(c => ({ category: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
    const { category } = await params
    const cat = getPlaygroundCategory(category)
    if (!cat) return {}
    const title = `${cat.title} Interview Practice Game | Prodsnap Playground`
    const description = `Learn how to crack ${cat.title} PM interview cases step by step. Short lessons and quick multiple-choice questions from real cases. No typing needed.`
    return {
        title,
        description,
        alternates: { canonical: `/playground/${cat.slug}` },
        openGraph: { title, description, url: `https://prodsnap.in/playground/${cat.slug}` },
    }
}

export default async function PlaygroundCategoryPage({ params }: { params: Promise<{ category: string }> }) {
    const { category } = await params
    const cat = getPlaygroundCategory(category)
    const data = getCategoryData(category)
    if (!cat || !data) notFound()

    const sectionOrder = getSectionOrder(category)

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
            <Header />
            <main className="flex-grow pt-24 pb-16 px-4">
                <div className="max-w-3xl mx-auto">
                    <CategoryGame category={cat} data={data} sectionOrder={sectionOrder} />
                </div>
            </main>
            <Footer />
        </div>
    )
}
