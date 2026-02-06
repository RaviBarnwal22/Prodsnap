import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Briefcase, BarChart3, TrendingUp, Cpu, Rocket, Users, Search, Calculator, Sparkles, Target, Zap, Globe, CheckCircle2, Linkedin } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
    const categories = [
        {
            label: "Product Design",
            key: "CONSUMER_PRODUCT_DESIGN",
            icon: <Briefcase size={24} />,
            color: "text-blue-600",
            description: "Master the art of designing products for the next billion users. This track covers everything from hyperlocal Indian logistics to vernacular fintech solutions."
        },
        {
            label: "Success Metrics",
            key: "METRICS",
            icon: <BarChart3 size={24} />,
            color: "text-purple-600",
            description: "Develop deep analytical rigor. Learn to define North Star metrics, handle metric trade-offs, and measure success for multi-faceted platforms."
        },
        {
            label: "Growth Strategy",
            key: "GROWTH_RETENTION",
            icon: <TrendingUp size={24} />,
            color: "text-orange-600",
            description: "Learn how to drive sustainable growth. Focus on habit formation, referral loops, and retention mechanics for competitive markets."
        },
        {
            label: "Tech Acumen",
            key: "TECH_ACUMEN",
            icon: <Cpu size={24} />,
            color: "text-cyan-600",
            description: "Bridge the gap between product and engineering. Learn to articulate technical concepts and understand system design."
        },
        {
            label: "Go-to-Market",
            key: "GTM",
            icon: <Rocket size={24} />,
            color: "text-pink-600",
            description: "Master the art of product launches. From pricing to positioning, learn how to take products to market effectively."
        },
        {
            label: "Behavioral",
            key: "BEHAVIORAL",
            icon: <Users size={24} />,
            color: "text-indigo-600",
            description: "Prepare for the human side of PM interviews. Practice storytelling and leadership scenarios using the STAR method."
        },
        {
            label: "Root Cause Analysis",
            key: "RCA",
            icon: <Search size={24} />,
            color: "text-red-600",
            description: "When things break, PMs need to find out why. Learn systematic approaches to diagnosing metric drops and bugs."
        },
        {
            label: "Guestimates",
            key: "GUESTIMATES",
            icon: <Calculator size={24} />,
            color: "text-emerald-600",
            description: "Sharpen your estimation skills. Practice breaking down complex numbers into logical assumptions and market sizing."
        }
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col font-sans">
            <Header />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative py-24 px-4 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-violet-50/50 to-white dark:from-gray-900 dark:to-gray-950 pointer-events-none" />
                    <div className="container mx-auto max-w-6xl relative z-10 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-bold uppercase tracking-widest mb-6">
                            <Sparkles size={14} />
                            About Prodsnap
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-gray-900 dark:text-white mb-8">
                            Mastering Product Management <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600">
                                Is No Longer a Guessing Game
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-10">
                            Prodsnap is the ultimate AI-powered training ground for aspiring and seasoned Product Managers.
                            We bridge the gap between theory and practice with real-world scenarios and instant, personalized feedback.
                        </p>
                    </div>
                </section>

                {/* Mission / Value Prop */}
                <section className="py-20 px-4 bg-white dark:bg-gray-950 border-y border-gray-100 dark:border-gray-900">
                    <div className="container mx-auto max-w-6xl">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-6 text-gray-900 dark:text-white">
                                    Why We Built Prodsnap
                                </h2>
                                <div className="space-y-6 text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                                    <p>
                                        Breaking into Product Management is tough. The interviews are grueling, covering everything from design sense to technical architecture.
                                        Most resources offer static advice, but they don't give you a place to <strong>practice</strong>.
                                    </p>
                                    <p>
                                        We built Prodsnap to change that. We believe that product sense is a muscle that can be built through repetition and feedback.
                                        Our platform simulates the interview environment, challenging you with diverse cases and providing immediate, actionable critique driven by advanced AI models.
                                    </p>
                                    <div className="flex flex-col gap-3 mt-4">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="text-green-500 flex-shrink-0" size={20} />
                                            <span>Practice with 100+ real-world case studies</span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="text-green-500 flex-shrink-0" size={20} />
                                            <span>Refine your communication with voice-to-text submissions</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
                                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                                        <Target size={24} />
                                    </div>
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Precision</h3>
                                    <p className="text-sm text-gray-500">Targeted feedback on every part of your answer.</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center hover:-translate-y-1 transition-transform mt-8">
                                    <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center mb-4">
                                        <Zap size={24} />
                                    </div>
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Speed</h3>
                                    <p className="text-sm text-gray-500">No waiting for mentors. Practice 24/7 at your own pace.</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
                                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                                        <Globe size={24} />
                                    </div>
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Relevance</h3>
                                    <p className="text-sm text-gray-500">Cases tailored for global and Indian markets.</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center hover:-translate-y-1 transition-transform mt-8">
                                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-4">
                                        <Target size={24} />
                                    </div>
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Structure</h3>
                                    <p className="text-sm text-gray-500">Master industry-standard frameworks like CIRCLES.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Categories Section */}
                <section className="py-24 px-4 bg-slate-50 dark:bg-gray-900/50">
                    <div className="container mx-auto max-w-6xl">
                        <div className="text-center mb-16">
                            <h2 className="text-sm font-black uppercase tracking-widest text-violet-600 mb-3">Comprehensive Curriculum</h2>
                            <h3 className="text-4xl font-black text-gray-900 dark:text-white">Every Skill You Need to Succeed</h3>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {categories.map((cat, idx) => (
                                <Link href={`/practice?category=${cat.key}`} key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gray-50 dark:bg-gray-700/50 ${cat.color} group-hover:scale-110 transition-transform`}>
                                        {cat.icon}
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{cat.label}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                        {cat.description}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-20 px-4">
                    <div className="container mx-auto max-w-4xl bg-gradient-to-r from-violet-600 to-blue-600 rounded-[3rem] p-12 text-center text-white shadow-2xl shadow-blue-500/30 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-5xl font-black mb-6">Ready to Crack Your PM Interview?</h2>
                            <p className="text-lg md:text-xl opacity-90 mb-10 max-w-2xl mx-auto">
                                Join thousands of aspiring Product Managers who are leveling up their skills with Prodsnap.
                            </p>
                            <Link href="/practice" className="inline-block bg-white text-violet-600 px-10 py-4 rounded-full font-black text-lg hover:bg-gray-50 hover:scale-105 transition-all shadow-xl">
                                Start practicing with AI simulator for free
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Meet the Creator */}
                <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900/30">
                    <div className="container mx-auto max-w-5xl">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 dark:border-gray-700">
                            <div className="text-center mb-10">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-widest">
                                    Meet the Founder
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
                                <div className="w-56 h-56 md:w-72 md:h-72 relative flex-shrink-0">
                                    <div className="absolute inset-0 bg-violet-600 rounded-full blur-2xl opacity-20 transform translate-y-4"></div>
                                    <img
                                        src="/ravi-barnwal-headshot.jpg"
                                        alt="Ravi Barnwal"
                                        className="w-full h-full object-cover rounded-full border-4 border-white dark:border-gray-700 shadow-2xl relative z-10"
                                    />
                                </div>
                                <div className="text-center md:text-left flex-1">
                                    <h3 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">Ravi Barnwal</h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-8">
                                        A product leader with a passion for democratizing access to top-tier career coaching.
                                        Ravi built Prodsnap to solve the gap between theoretical knowledge and practical application in Product Management interviews.
                                        With deep experience in building scalable products, he's on a mission to help the next generation of PMs land their dream roles through AI-driven mentorship.
                                    </p>

                                    <a href="https://www.linkedin.com/in/barnwalravi/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#0077b5] text-white px-6 py-3 rounded-full font-bold hover:bg-[#006396] transition-all hover:scale-105 shadow-lg shadow-blue-500/20">
                                        <Linkedin size={20} />
                                        <span>Connect on LinkedIn</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </main>
            <Footer />
        </div>
    );
}
