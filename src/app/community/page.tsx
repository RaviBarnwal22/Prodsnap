import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import Link from "next/link"
import { Users, MessageCircle, BookOpen, Briefcase, ArrowRight, CheckCircle, Calendar, Clock, User, Sparkles } from "lucide-react"

export default function CommunityPage() {
    const benefits = [
        {
            icon: <Briefcase size={24} />,
            title: "PM Job Openings",
            description: "Get notified about the latest Product Management openings at top companies before anyone else."
        },
        {
            icon: <BookOpen size={24} />,
            title: "Exclusive Materials",
            description: "Access curated PM interview guides, frameworks, case studies, and preparation resources."
        },
        {
            icon: <Users size={24} />,
            title: "Peer Learning",
            description: "Connect with aspiring and experienced PMs, share experiences, and learn from each other."
        },
        {
            icon: <MessageCircle size={24} />,
            title: "Expert Guidance",
            description: "Get your doubts answered by mentors and community experts in real-time discussions."
        }
    ]

    const features = [
        "Daily PM job updates from top companies",
        "Weekly case study discussions",
        "Resume review sessions",
        "Mock interview partner matching",
        "Exclusive webinars with industry PMs",
        "Early access to new ProdSnap features"
    ]

    const blogPosts = [
        {
            title: "Product Sense Explained: Thinking Like a PM (with a CIRCLES Case)",
            excerpt: "What do interviewers mean by Product Sense? Learn how to navigate ambiguity and arrive at well-reasoned product decisions.",
            author: "Ravi Barnwal",
            date: "Jan 10, 2026",
            readTime: "8 min read",
            category: "Product Sense",
            image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop",
            url: "https://www.linkedin.com/pulse/product-sense-explained-thinking-like-pm-circles-case-ravi-barnwal-vlk1c"
        },
        {
            title: "Mastering the 'Vibe Coding' - The Next Frontier in Product Interviews & Prototyping",
            excerpt: "A deep dive into the 'Vibe' era of product development and interviews.",
            author: "Ravi Barnwal",
            date: "Nov 12, 2025",
            readTime: "5 min read",
            category: "Product Sense",
            image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=500&fit=crop",
            url: "https://www.linkedin.com/pulse/mastering-vibe-coding-next-frontier-product-ravi-barnwal-bi0he"
        },
        {
            title: "Prodsnap #13: The Career Trajectory to Become a Product Manager in 2025",
            excerpt: "A step-by-step guide for breaking into or growing in product management in 2025.",
            author: "Ravi Barnwal",
            date: "Sep 7, 2025",
            readTime: "7 min read",
            category: "Career",
            image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&h=500&fit=crop",
            url: "https://www.linkedin.com/pulse/prodsnap-13-career-trajectory-become-product-manager-2025-barnwal-bgwhc"
        },
        {
            title: "Prodsnap #12: AI Product Manager – The Present & The Future",
            excerpt: "Exploring the evolving role of AI in product management.",
            author: "Ravi Barnwal",
            date: "Mar 29, 2025",
            readTime: "6 min read",
            category: "AI",
            image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=500&fit=crop",
            url: "https://www.linkedin.com/pulse/prodsnap-12-ai-product-manager-present-future-ravi-barnwal-yzcuc"
        },
        {
            title: "Prodsnap Chapter 11: Where Ideas Begin: Feature Prioritization",
            excerpt: "Guidance on how to manage and prioritize product features effectively.",
            author: "Ravi Barnwal",
            date: "Jan 1, 2025",
            readTime: "8 min read",
            category: "Methodology",
            image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=500&fit=crop",
            url: "https://www.linkedin.com/pulse/prodsnap-chapter-11-where-ideas-begin-product-managers-ravi-barnwal-vpckc"
        },
        {
            title: "Prodsnap Newsletter Chapter 10: Agile vs. Waterfall",
            excerpt: "Comparing methodologies from a practical, real-world viewpoint.",
            author: "Ravi Barnwal",
            date: "Nov 26, 2024",
            readTime: "5 min read",
            category: "Agile",
            image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&h=500&fit=crop",
            url: "https://www.linkedin.com/pulse/prodsnap-newsletter-chapter-10-agile-vs-waterfall-ravi-barnwal-dzjxe"
        }
    ]

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col font-sans">
            <Header />

            <main className="flex-grow pt-20">
                {/* Community Hero Section */}
                <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 py-20 md:py-32 px-4">
                    <div className="absolute top-20 right-10 w-72 h-72 bg-green-400/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl"></div>

                    <div className="container mx-auto max-w-7xl relative z-10">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            {/* Left Column: Text Content */}
                            <div className="text-center lg:text-left">
                                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 text-gray-900 dark:text-white leading-[1.1]">
                                    Join Our <br className="hidden md:block" />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500">WhatsApp Community</span>
                                </h1>

                                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed uppercase font-bold text-xs tracking-widest">
                                    Connect with fellow PM aspirants, get exclusive job updates, access premium resources, and accelerate your career.
                                </p>

                                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                                    <a
                                        href="https://chat.whatsapp.com/JYgbtlHtD2BGinjpdADJXG"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-full font-black text-sm hover:shadow-xl hover:shadow-green-500/30 transition-all group uppercase tracking-widest"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                        Join WhatsApp
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </a>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-6 font-black uppercase tracking-[0.2em]">Free to join • No spam • Moderated by PM experts</p>
                            </div>

                            {/* Right Column: Benefits Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                {benefits.map((benefit, i) => (
                                    <div key={i} className={`p-6 rounded-[2rem] border border-white/50 dark:border-gray-800/50 backdrop-blur-md shadow-xl transition-all hover:scale-[1.02] ${i % 2 === 0 ? 'bg-white/60 dark:bg-gray-900/60 translate-y-4' : 'bg-white/40 dark:bg-gray-800/40'}`}>
                                        <div className="w-10 h-10 bg-green-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-green-500/20">
                                            {benefit.icon}
                                        </div>
                                        <h3 className="text-sm font-black mb-2 uppercase tracking-tight">{benefit.title}</h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-[10px] leading-relaxed font-bold">{benefit.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Newsletter & Blog Section */}
                <section className="py-24 px-4 bg-gray-50 dark:bg-gray-900/50">
                    <div className="container mx-auto max-w-6xl">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-black uppercase tracking-widest mb-6 border border-blue-100 dark:border-blue-800">
                                <BookOpen size={14} />
                                Knowledge Hub
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black mb-4 italic tracking-tight uppercase">The ProdSnap <span className="text-blue-600">Blog</span></h2>
                            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto uppercase font-bold text-xs tracking-widest leading-loose">
                                Deep dives into product sense, career growth, and the future of PM.
                            </p>
                        </div>

                        {/* LinkedIn Newsletter Banner */}
                        <a
                            href="https://www.linkedin.com/newsletters/7248247994762854400/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-white hover:shadow-2xl hover:shadow-blue-500/20 transition-all group mb-20"
                        >
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                                        LinkedIn Newsletter
                                    </div>
                                    <h3 className="text-3xl font-black mb-2">ProdSnap Newsletter</h3>
                                    <p className="text-blue-100 max-w-md text-sm font-medium">
                                        Join 2,000+ professionals for weekly guides on breaking into or growing in product management.
                                    </p>
                                </div>
                                <div className="shrink-0">
                                    <span className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-full font-black text-sm group-hover:bg-blue-50 transition-colors uppercase">
                                        Subscribe
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </div>
                            </div>
                        </a>

                        {/* Blog Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {blogPosts.map((post, i) => (
                                <a key={i} href={post.url} target="_blank" rel="noopener noreferrer" className="group cursor-pointer">
                                    <div className="aspect-[16/10] bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-3xl mb-6 overflow-hidden relative shadow-lg">
                                        <div className="absolute inset-0 flex items-center justify-center p-6 text-white/90 text-center z-0">
                                            <span className="text-lg font-bold line-clamp-3 leading-tight uppercase font-black">{post.title}</span>
                                        </div>
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 z-5"
                                        />
                                        <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors z-10 duration-300"></div>
                                        <div className="absolute top-4 left-4 inline-block bg-white dark:bg-gray-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest z-20 text-gray-800 dark:text-white border border-gray-100 dark:border-gray-800">
                                            {post.category}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                                        {post.title}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-2 font-medium">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center gap-4 text-[10px] text-gray-400 font-black uppercase tracking-widest">
                                        <div className="flex items-center gap-1.5"><Calendar size={12} className="text-blue-500" /> {post.date}</div>
                                        <div className="flex items-center gap-1.5"><Clock size={12} className="text-blue-500" /> {post.readTime}</div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    )
}
