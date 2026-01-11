import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Calendar, Clock, User } from "lucide-react"


export default function BlogPage() {
    const posts = [
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
        },
        {
            title: "Prodsnap Chapter #9: Agile and Its Methodologies",
            excerpt: "A detailed look into Agile frameworks and methodologies.",
            author: "Ravi Barnwal",
            date: "Nov 16, 2024",
            readTime: "9 min read",
            category: "Agile",
            image: "https://images.unsplash.com/photo-1572177812156-58036aae439c?w=800&h=500&fit=crop",
            url: "https://www.linkedin.com/pulse/prodsnap-chapter-9-agile-its-methodologies-guide-product-ravi-barnwal-yyb7c"
        },
        {
            title: "Prodsnap Chapter #8: Lean Product Development",
            excerpt: "Principles of Lean development for optimizing resources.",
            author: "Ravi Barnwal",
            date: "Nov 10, 2024",
            readTime: "10 min read",
            category: "Lean",
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop",
            url: "https://www.linkedin.com/pulse/prodsnap-chapter-8-lean-product-development-building-smart-barnwal-q6ckc"
        },
        {
            title: "ProdSnap: Chapter 7: Product Development Lifecycle",
            excerpt: "A foundational guide to the stages of product development.",
            author: "Ravi Barnwal",
            date: "Oct 26, 2024",
            readTime: "12 min read",
            category: "Lifecycle",
            image: "https://images.unsplash.com/photo-1553484771-371a605b060b?w=800&h=500&fit=crop",
            url: "https://www.linkedin.com/pulse/prodsnap-chapter-7-product-development-lifecycle-ravi-barnwal-szgfc"
        },
        {
            title: "Product Manager vs. Project Manager vs. Product Owner vs. Program Manager",
            excerpt: "Understanding the key differences between PM roles in product development.",
            author: "Ravi Barnwal",
            date: "Oct 2024",
            readTime: "8 min read",
            category: "Career",
            image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop",
            url: "https://www.linkedin.com/pulse/product-manager-vs-project-owner-program-ravi-barnwal-x89oc"
        },
        {
            title: "ProdSnap: Chapter 5: Understanding the Product Lifecycle – Lessons from Apple's iPod",
            excerpt: "Learn product lifecycle stages through the iconic journey of Apple's iPod.",
            author: "Ravi Barnwal",
            date: "Oct 2024",
            readTime: "10 min read",
            category: "Lifecycle",
            image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=500&fit=crop",
            url: "https://www.linkedin.com/pulse/prodsnap-chapter-5-understanding-product-lifecycle-ravi-barnwal-9wqdc"
        },
        {
            title: "Prodsnap Chapter #4: Navigating PM Roles—Internal, B2B, or B2C?",
            excerpt: "Dive deep into what it means to be an Internal PM, B2B PM, and B2C PM. Find your perfect fit!",
            author: "Ravi Barnwal",
            date: "Sep 2024",
            readTime: "8 min read",
            category: "Career",
            image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=500&fit=crop",
            url: "https://www.linkedin.com/pulse/prodsnap-chapter4-navigating-product-management-b2b-b2c-ravi-barnwal-gehjc/"
        },
        {
            title: "Prodsnap Chapter #3: Types of Product Management",
            excerpt: "An introduction to the three broad categories of product management roles and what sets them apart.",
            author: "Ravi Barnwal",
            date: "Sep 2024",
            readTime: "6 min read",
            category: "Career",
            image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop",
            url: "https://www.linkedin.com/pulse/prodsnap-chapter3-types-product-management-ravi-barnwal-40jhc/"
        },
        {
            title: "Chapter 2: What is a Product?",
            excerpt: "Understanding the fundamental definition of a product and its characteristics in the PM context.",
            author: "Ravi Barnwal",
            date: "Aug 2024",
            readTime: "5 min read",
            category: "Fundamentals",
            image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=500&fit=crop",
            url: "https://www.linkedin.com/pulse/chapter-2-what-product-ravi-barnwal-dgitc/"
        },
        {
            title: "Chapter 1: Ambiguity – The Essence of Product Management",
            excerpt: "Exploring why ambiguity is at the heart of product management and how to embrace it.",
            author: "Ravi Barnwal",
            date: "Aug 2024",
            readTime: "5 min read",
            category: "Fundamentals",
            image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=500&fit=crop",
            url: "https://www.linkedin.com/pulse/chapter-1-ambiguity-essence-product-management-ravi-barnwal-f2tmc/"
        }
    ]

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
            <Header />
            <main className="flex-grow pt-12">

                {/* Newsletter Banner */}
                <section className="py-12 px-4">
                    <a
                        href="https://www.linkedin.com/newsletters/7248247994762854400/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="container mx-auto max-w-4xl block bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-white hover:shadow-2xl hover:shadow-blue-500/20 transition-all group"
                    >
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold mb-4">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                                    </svg>
                                    LinkedIn Newsletter
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black mb-2">ProdSnap Newsletter</h2>
                                <p className="text-blue-100 max-w-md">
                                    A comprehensive guide for aspiring and experienced professionals to break into or grow in product management.
                                </p>
                            </div>
                            <div className="shrink-0">
                                <span className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-full font-black text-lg group-hover:bg-blue-50 transition-colors">
                                    Subscribe on LinkedIn
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </a>
                </section>

                {/* Popular Posts */}
                <section className="py-20 px-4 container mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
                        {posts.map((post, i) => (
                            <a key={i} href={post.url} target="_blank" rel="noopener noreferrer" className="group cursor-pointer">
                                <div className="aspect-[16/10] bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-3xl mb-6 overflow-hidden relative">
                                    {/* Fallback content - always visible behind image */}
                                    <div className="absolute inset-0 flex items-center justify-center p-6 text-white/90 text-center z-0">
                                        <span className="text-lg font-bold line-clamp-3 leading-tight">{post.title}</span>
                                    </div>
                                    {/* Image on top - hides fallback when loaded */}
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 z-5"
                                    />
                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors z-10 duration-300"></div>
                                    {/* Category badge */}
                                    <div className="absolute top-4 left-4 inline-block bg-white dark:bg-gray-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest z-20 text-gray-800 dark:text-white">
                                        {post.category}
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                                    {post.title}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-2">
                                    {post.excerpt}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                                    <div className="flex items-center gap-1"><User size={14} /> {post.author}</div>
                                    <div className="flex items-center gap-1"><Calendar size={14} /> {post.date}</div>
                                    <div className="flex items-center gap-1"><Clock size={14} /> {post.readTime}</div>
                                </div>
                            </a>
                        ))}
                    </div>
                </section>

                <section className="py-20 bg-blue-50 dark:bg-blue-900/10 flex justify-center">
                    <div className="text-center px-4">
                        <h3 className="text-2xl font-bold mb-2">Want new articles in your inbox?</h3>
                        <p className="text-gray-500 mb-6">Join 15,000+ ambitious PMs subscribing to our weekly newsletter.</p>
                        <form className="flex flex-col sm:row gap-2 max-w-md mx-auto">
                            <input type="email" placeholder="email@example.com" className="px-6 py-3 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" />
                            <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold">Subscribe</button>
                        </form>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}
