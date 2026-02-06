import React from 'react'
import { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import {
    Newspaper, Sparkles, TrendingUp, Cpu, Globe, ArrowRight,
    Calendar, Bookmark, Share2, Rocket, Shield, Brain, ExternalLink,
    Zap, MessageSquare, Bot, Box, History
} from 'lucide-react'
import Link from 'next/link'
import { NewsletterForm } from '@/components/NewsletterForm'
import { getAINews, getAvailablePeriods } from './actions'

export const metadata: Metadata = {
    title: "AI Daily Digest | Prodsnap Portal",
    description: "Stay updated with the latest AI trends, implementations, and tech news curated for Product Managers.",
}

const IconMap: { [key: string]: React.ReactNode } = {
    Rocket: <Rocket className="text-blue-500" size={20} />,
    Shield: <Shield className="text-purple-500" size={20} />,
    Brain: <Brain className="text-emerald-500" size={20} />,
    Cpu: <Cpu className="text-green-500" size={20} />,
    Globe: <Globe className="text-red-500" size={20} />,
    TrendingUp: <TrendingUp className="text-orange-500" size={20} />,
    Newspaper: <Newspaper className="text-gray-500" size={20} />,
    Zap: <Zap className="text-yellow-500" size={20} />,
    MessageSquare: <MessageSquare className="text-cyan-500" size={20} />,
    Bot: <Bot className="text-indigo-500" size={20} />,
    Box: <Box className="text-amber-500" size={20} />,
}

interface PageProps {
    searchParams: {
        view?: string;
        period?: string;
    }
}

export default async function AINewsPage(props: {
    searchParams: Promise<{ view?: string; period?: string }>
}) {
    const searchParams = await props.searchParams;
    const view = (searchParams.view?.toUpperCase() as 'DAILY' | 'WEEKLY_TOP' | 'MONTHLY_TOP') || 'DAILY';
    const period = searchParams.period;

    const newsItems = await getAINews(view, period);
    const availablePeriods = await getAvailablePeriods(view);

    const formattedToday = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const activePeriodLabel = period
        ? availablePeriods.find(p => p.periodIdentifier === period)?.date || period
        : "Latest Update";

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
            <Header />

            <main className="flex-grow pb-24">
                {/* Hero Section */}
                <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-950 pt-16 pb-20 border-b border-gray-100 dark:border-gray-800">
                    <div className="container mx-auto px-4 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-xs font-black uppercase tracking-widest mb-6 border border-violet-100 dark:border-violet-800">
                            <Sparkles size={14} />
                            Daily Intelligence
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
                            AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">Daily Digest</span>
                        </h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                            Stay ahead of the curve. Daily updates on AI breakthroughs and implementations, curated specifically for Product Managers.
                        </p>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center gap-8 h-16">
                            {[
                                { id: 'DAILY', label: 'Daily Feed' },
                                { id: 'WEEKLY_TOP', label: 'Weekly Top 10' },
                                { id: 'MONTHLY_TOP', label: 'Monthly Top 25' }
                            ].map(tab => (
                                <Link
                                    key={tab.id}
                                    href={`/ai-news?view=${tab.id.toLowerCase()}`}
                                    className={`relative h-full flex items-center text-sm font-black uppercase tracking-widest transition-colors ${view === tab.id
                                        ? 'text-violet-600'
                                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                                        }`}
                                >
                                    {tab.label}
                                    {view === tab.id && (
                                        <div className="absolute bottom-0 left-0 w-full h-1 bg-violet-600 rounded-t-full" />
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 mt-12">
                    <div className="grid lg:grid-cols-4 gap-12">
                        {/* Period Sidebar */}
                        <div className="space-y-8">
                            <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-[2rem] border border-gray-100 dark:border-gray-800">
                                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                                    <History size={14} />
                                    Archive
                                </h3>
                                <div className="space-y-1">
                                    {availablePeriods.map((p, i) => (
                                        <Link
                                            key={i}
                                            href={`/ai-news?view=${view.toLowerCase()}&period=${p.periodIdentifier}`}
                                            className={`block px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${period === p.periodIdentifier
                                                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                                                : (!period && i === 0)
                                                    ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-600'
                                                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                }`}
                                        >
                                            {p.date}
                                        </Link>
                                    ))}
                                    {availablePeriods.length === 0 && (
                                        <p className="text-xs text-gray-400 italic px-4">No archives yet</p>
                                    )}
                                </div>
                            </div>

                            {/* Newsletter remains here */}
                            <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-violet-500/20">
                                <h3 className="text-2xl font-black mb-4">Stay Informed</h3>
                                <NewsletterForm />
                                <p className="text-[10px] text-white/40 text-center mt-4 uppercase tracking-tighter">
                                    Join 4,500+ product leads
                                </p>
                            </div>
                        </div>

                        {/* Main Feed */}
                        <div className="lg:col-span-3 space-y-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <Calendar className="text-violet-600" size={24} />
                                    <h2 className="text-2xl font-black">
                                        {activePeriodLabel}
                                    </h2>
                                </div>
                            </div>

                            {newsItems.length > 0 ? (
                                <div className="space-y-10">
                                    {newsItems.map((item: any) => (
                                        <article key={item.id} className="group bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 hover:shadow-2xl hover:shadow-violet-500/5 transition-all duration-500 relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1.5 h-full bg-violet-600/20 group-hover:bg-violet-600 transition-colors" />

                                            <div className="flex flex-col gap-6">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-black uppercase tracking-widest text-violet-600 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800">
                                                        {item.category}
                                                    </span>
                                                    <div className="flex items-center gap-3 text-gray-400">
                                                        <button className="hover:text-violet-600 transition"><Bookmark size={18} /></button>
                                                        <button className="hover:text-violet-600 transition"><Share2 size={18} /></button>
                                                    </div>
                                                </div>

                                                <div className="flex gap-6">
                                                    <div className="hidden sm:flex shrink-0 w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800 items-center justify-center text-2xl shadow-inner italic">
                                                        {IconMap[item.iconName] || <Newspaper size={20} />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="group/title block">
                                                            <h3 className="text-2xl font-black mb-4 leading-tight group-hover/title:text-violet-600 transition-colors flex items-start gap-2">
                                                                {item.title}
                                                                <ExternalLink size={18} className="shrink-0 mt-1 opacity-0 group-hover/title:opacity-100 transition-opacity text-violet-600" />
                                                            </h3>
                                                        </a>

                                                        <div className="flex items-center gap-4 text-xs font-bold text-gray-400 mb-6">
                                                            <span className="flex items-center gap-1.5"><Newspaper size={14} /> {item.source}</span>
                                                            {view !== 'DAILY' && <span>• Curated Day: {item.date}</span>}
                                                        </div>
                                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                                                            {item.summary}
                                                        </p>

                                                        <div className="bg-violet-50/50 dark:bg-violet-900/10 p-6 rounded-3xl border border-violet-100/50 dark:border-violet-800/30 mb-8">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <Brain className="text-violet-600" size={16} />
                                                                <h4 className="text-xs font-black uppercase tracking-widest text-violet-900 dark:text-violet-300">The PM&apos;s Perspective</h4>
                                                            </div>
                                                            <p className="text-sm font-medium text-violet-900/80 dark:text-violet-200/80 leading-relaxed">
                                                                {item.pmPerspective}
                                                            </p>
                                                        </div>

                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                                            <div className="flex flex-wrap gap-2">
                                                                {item.tags.map((tag: string) => (
                                                                    <span key={tag} className="text-[10px] font-bold text-gray-400 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 rounded-md">
                                                                        #{tag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-black text-violet-600 hover:gap-3 transition-all">
                                                                Read Full Story <ArrowRight size={16} />
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-24 bg-gray-50 dark:bg-gray-900/50 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                                        <History size={32} />
                                    </div>
                                    <h3 className="text-xl font-black mb-2">No archive found</h3>
                                    <p className="text-gray-400 max-w-xs mx-auto text-sm">We haven't created a snapshot for this period yet. Check back soon!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
