import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { PLAYGROUND_CATEGORIES } from '@/lib/playground/categories'
import { getSectionOrder, getQuestionCount } from '@/lib/playground/content'
import { PlaygroundHub } from './PlaygroundHub'

export const metadata: Metadata = {
    title: 'PM Playground | Learn to Crack PM Interview Cases, Step by Step',
    description: 'A game that teaches you how to solve every type of product management interview case: design, RCA, metrics, guesstimates, strategy and more. Short lessons and quick questions from real cases. No typing.',
    alternates: { canonical: '/playground' },
    openGraph: {
        title: 'PM Playground | Learn to Crack PM Interview Cases',
        description: 'Short lessons and quick multiple-choice questions from real PM cases. Learn the method for every case type.',
        url: 'https://prodsnap.in/playground',
    },
}

export default function PlaygroundPage() {
    const categories = PLAYGROUND_CATEGORIES.map(c => ({
        ...c,
        sectionKeys: getSectionOrder(c.slug),
        questionCount: getQuestionCount(c.slug),
    }))

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
            <Header />
            <main className="flex-grow pt-24 pb-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <PlaygroundHub categories={categories} />
                </div>
            </main>
            <Footer />
        </div>
    )
}
