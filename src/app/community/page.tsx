import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { CommunityContent, FeaturedGuide } from "@/components/CommunityContent"
import { Briefcase, BookOpen, Users, MessageCircle } from "lucide-react"

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

    const featuredGuides: FeaturedGuide[] = [
        {
            href: "/product-management-interview/design-uber-for-kids",
            title: "Design Uber for Kids: Complete Product Sense Framework & Solution",
            excerpt: "Learn how to clarify constraints, balance multi-sided user incentives across parents, kids, and drivers, and design safety-critical features.",
            category: "Product Sense",
            readTime: "7 min read",
            difficulty: "Medium",
            companies: ["Uber", "Google", "Meta"]
        },
        {
            href: "/product-management-interview/swiggy-delivery-time-rca",
            title: "Average Delivery Time Spiked by 15% on Swiggy: Step-by-Step RCA Case",
            excerpt: "How to diagnose metric anomalies. Deconstruct the delivery funnel, isolate merchant bottlenecks, and design algorithmic fixes.",
            category: "Root Cause Analysis",
            readTime: "6 min read",
            difficulty: "Hard",
            companies: ["Swiggy", "Zomato", "DoorDash"]
        },
        {
            href: "/product-management-interview/improve-whatsapp-groups",
            title: "How Would You Improve WhatsApp Groups? Meta PM Case Breakdown",
            excerpt: "Solve signal loss and notification fatigue in high-volume community chats without compromising WhatsApp's hallmark simplicity.",
            category: "Product Design",
            readTime: "8 min read",
            difficulty: "Medium",
            companies: ["Meta", "WhatsApp", "Slack"]
        },
        {
            href: "/product-management-interview/google-maps-smart-parking",
            title: "Design a Smart Parking Finder for Google Maps: PM Case Guide",
            excerpt: "User journey mapping for urban drivers, multi-layered telemetry ingestion (sensor APIs vs Bluetooth disconnects), and in-route reservation flows.",
            category: "Product Sense",
            readTime: "7 min read",
            difficulty: "Medium",
            companies: ["Google", "Apple", "Uber"]
        },
        {
            href: "/frameworks/rice",
            title: "RICE Prioritization Framework: Formula & Real Roadmap Examples",
            excerpt: "Master Reach, Impact, Confidence, and Effort scoring to make objective, defensible roadmap decisions under resource constraints.",
            category: "Frameworks",
            readTime: "5 min read",
            difficulty: "Core",
            companies: ["Intercom", "Atlassian"]
        },
        {
            href: "/frameworks/kano-model",
            title: "The Kano Model: Prioritizing Features for Customer Delight",
            excerpt: "Classify must-haves, performance features, and delighters to prevent customer dissatisfaction and discover winning differentiators.",
            category: "Frameworks",
            readTime: "5 min read",
            difficulty: "Core",
            companies: ["Amazon", "Spotify"]
        },
        {
            href: "/frameworks/circles-method",
            title: "The CIRCLES Method: The Gold Standard for Product Design Rounds",
            excerpt: "Master the 7-step sequence to clarify constraints, segment users, cut through pain points, brainstorm bold ideas, and define metrics.",
            category: "Frameworks",
            readTime: "7 min read",
            difficulty: "Core",
            companies: ["Google", "Meta", "Amazon", "Uber"]
        },
        {
            href: "/frameworks/heart-framework",
            title: "Google's HEART Framework: Measuring UX & Product Quality",
            excerpt: "How to define and track Happiness, Engagement, Adoption, Retention, and Task Success using the Goals-Signals-Metrics model.",
            category: "Frameworks",
            readTime: "6 min read",
            difficulty: "Core",
            companies: ["Google", "YouTube", "Microsoft"]
        }
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
            <main className="flex-grow pt-16">
                <CommunityContent benefits={benefits} blogPosts={blogPosts} featuredGuides={featuredGuides} />
            </main>
            <Footer />
        </div>
    )
}
