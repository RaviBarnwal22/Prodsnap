import React from 'react'
import { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import {
    Briefcase, MapPin, Clock, ExternalLink,
    Search, Filter, Sparkles, Building2,
    Layers, Zap, ArrowUpRight, CheckCircle2,
    CalendarDays
} from 'lucide-react'
import Link from 'next/link'
import { getJobs } from './actions'

export const metadata: Metadata = {
    title: "PM Job Openings | Prodsnap",
    description: "Curated Product Management opportunities in India. Updated daily from top tech companies and startups.",
}

interface PageProps {
    searchParams: Promise<{
        type?: string;
        cat?: string;
        q?: string;
        region?: string;
    }>
}

export default async function JobsPage(props: PageProps) {
    const searchParams = await props.searchParams;
    const currentType = searchParams.type || 'ALL';
    const currentCat = searchParams.cat || 'ALL';
    const currentRegion = searchParams.region || 'ALL';
    const query = searchParams.q || '';

    const allJobs = await getJobs();

    // Advanced Filtering
    const filteredJobs = allJobs.filter((job: any) => {
        const matchesType = currentType === 'ALL' || job.jobType === currentType;
        const matchesCat = currentCat === 'ALL' || job.category === currentCat;
        const matchesRegion = currentRegion === 'ALL' ||
            (job.location && job.location.toLowerCase().includes(currentRegion.toLowerCase()));
        const matchesQuery = !query ||
            job.title.toLowerCase().includes(query.toLowerCase()) ||
            job.company.toLowerCase().includes(query.toLowerCase());
        return matchesType && matchesCat && matchesRegion && matchesQuery;
    });

    const categories = ['PM', 'APM', 'Senior PM', 'Lead', 'Director', 'Technical PM', 'Growth PM', 'Product Marketing'];
    const types = ['JOB', 'INTERNSHIP'];

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col selection:bg-violet-100 selection:text-violet-900">
            <Header />

            <main className="flex-grow">
                {/* Modern Minimal Hero */}
                <div className="relative border-b border-gray-100 dark:border-white/5 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 via-transparent to-fuchsia-50/30 dark:from-violet-950/20 dark:to-transparent pointer-events-none" />

                    <div className="container mx-auto px-4 pt-24 pb-20 relative z-10">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-violet-200 dark:border-violet-800">
                                <Sparkles size={12} />
                                Curated for India
                            </div>
                            <h1 className="text-6xl md:text-8xl font-black tracking-tight text-gray-900 dark:text-white mb-8 leading-[0.9]">
                                PM Job <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">Openings</span>
                            </h1>
                            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
                                Curated product roles from Bangalore, Hyderabad, Pune, Mumbai, and Delhi NCR. Deep-linked from verified career portals.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-16">
                    <div className="flex flex-col lg:flex-row gap-12">

                        {/* Elegant Sidebar Filters */}
                        <aside className="lg:w-72 shrink-0 space-y-10">
                            <div className="hidden lg:block">
                                <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                                    <Search size={14} /> Search
                                </h3>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        placeholder="Role or company..."
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 ring-violet-500/20 transition-all font-medium placeholder:text-gray-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="overflow-x-auto pb-4 -mx-4 px-4 lg:p-0 lg:m-0 no-scrollbar">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                        <MapPin size={14} /> Hubs
                                    </h3>
                                    <div className="flex flex-row lg:flex-col gap-2 min-w-max lg:min-w-0">
                                        <Link href="/jobs" className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${currentRegion === 'ALL' ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}>All</Link>
                                        {['Bangalore', 'Hyderabad', 'Pune', 'Mumbai', 'Delhi NCR', 'Remote'].map((city) => (
                                            <Link
                                                key={city}
                                                href={`/jobs?region=${city}&cat=${currentCat}&type=${currentType}`}
                                                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${currentRegion === city ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                                            >
                                                {city}
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                <div className="overflow-x-auto pb-4 -mx-4 px-4 lg:p-0 lg:m-0 no-scrollbar">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                        <Filter size={14} /> Category
                                    </h3>
                                    <div className="flex flex-row lg:flex-col gap-2 min-w-max lg:min-w-0">
                                        <Link href={`/jobs?region=${currentRegion}`} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${currentCat === 'ALL' ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}>All Roles</Link>
                                        {categories.map(cat => (
                                            <Link
                                                key={cat}
                                                href={`/jobs?cat=${cat}&region=${currentRegion}&type=${currentType}`}
                                                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${currentCat === cat ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                                            >
                                                {cat}
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                <div className="hidden lg:block pt-10 border-t border-gray-100 dark:border-white/5">
                                    <div className="flex items-center gap-3 text-violet-600 mb-2">
                                        <Zap size={20} fill="currentColor" />
                                        <span className="text-3xl font-black">{filteredJobs.length}</span>
                                    </div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Opportunities found</p>
                                </div>
                            </div>
                        </aside>

                        {/* Premium Job Grid */}
                        <div className="flex-1">
                            <div className="space-y-6">
                                {filteredJobs.length > 0 ? (
                                    filteredJobs.map((job: any) => (
                                        <div
                                            key={job.id}
                                            className="group bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-[2rem] p-6 md:p-8 transition-all hover:border-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/5 flex flex-col md:flex-row md:items-center gap-6 md:gap-8 relative overflow-hidden"
                                        >
                                            {/* Background blur blob */}
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-violet-500/10 transition-colors" />

                                            <div className="w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10 flex items-center justify-center border border-gray-200/50 dark:border-white/10 shadow-inner group-hover:scale-110 transition-transform">
                                                <Building2 className="text-gray-400 group-hover:text-violet-500 transition-colors" size={24} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                                                        {job.title}
                                                    </h3>
                                                    {job.jobType === 'INTERNSHIP' && (
                                                        <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[9px] font-black uppercase tracking-widest border border-amber-100 dark:border-amber-900/50">
                                                            Intern
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                                    <div className="text-violet-600 dark:text-violet-400 font-bold text-base md:text-lg">
                                                        {job.company}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-gray-400 font-medium text-xs md:text-sm">
                                                        <MapPin size={12} />
                                                        {job.location}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-gray-400 font-medium text-xs md:text-sm">
                                                        <Clock size={12} />
                                                        {job.salary || "Experienced"}
                                                    </div>
                                                </div>

                                                <div className="mt-4 md:mt-6 flex flex-wrap gap-2">
                                                    <span className="px-3 py-1 rounded-full bg-gray-50 dark:bg-white/5 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                        {job.category}
                                                    </span>
                                                    <span className="px-3 py-1 rounded-full bg-gray-50 dark:bg-white/5 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                                                        <CheckCircle2 size={10} className="text-emerald-500" />
                                                        {job.source}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-row md:flex-col items-center md:items-end justify-between self-stretch gap-4 md:gap-0 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-white/5">
                                                <div className="text-[10px] md:text-xs font-bold text-gray-300 dark:text-gray-600 flex items-center gap-1.5">
                                                    <CalendarDays size={12} />
                                                    {(!job.postedAt || job.postedAt === 'Unknown') ? 'Recently' : job.postedAt}
                                                </div>
                                                <a
                                                    href={job.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-xs md:text-sm transition-all hover:scale-105 active:scale-95 group/btn shadow-xl shadow-gray-950/10"
                                                >
                                                    Apply
                                                    <ArrowUpRight size={16} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                                </a>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-32 text-center rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-white/5 shadow-inner">
                                        <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                                            <Briefcase size={32} />
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-400 tracking-tight">No matching opportunities</h3>
                                        <p className="text-gray-400 text-sm mt-3 font-medium">Try relaxing your search or category filters.</p>
                                    </div>
                                )}
                            </div>

                            {/* Pagination/Load More - Visual Only */}
                            {filteredJobs.length > 0 && (
                                <div className="mt-16 text-center">
                                    <button className="px-8 py-4 bg-gray-50 dark:bg-white/5 text-gray-500 rounded-2xl font-black text-sm hover:bg-gray-100 active:scale-95 transition-all">
                                        Load More Opportunities
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modern CTA */}
                <div className="bg-gray-900 dark:bg-white py-24 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] -mr-[250px] -mt-[250px]" />
                    <div className="container mx-auto px-4 text-center relative z-10">
                        <h2 className="text-4xl md:text-5xl font-black text-white dark:text-gray-900 mb-8 tracking-tight">
                            Want new jobs in your inbox?
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                            <input
                                type="email"
                                placeholder="name@email.com"
                                className="flex-1 h-16 px-6 bg-white/10 dark:bg-gray-100 border border-white/20 dark:border-gray-200 rounded-2xl text-white dark:text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 ring-violet-500 transition-all font-bold"
                            />
                            <button className="h-16 px-10 bg-violet-600 text-white rounded-2xl font-black shadow-2xl shadow-violet-500/20 hover:scale-105 active:scale-95 transition-all">
                                Subscribe Free
                            </button>
                        </div>
                        <p className="mt-8 text-gray-500 font-bold text-xs uppercase tracking-widest">
                            Join 1,200+ Product Leaders from India
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
