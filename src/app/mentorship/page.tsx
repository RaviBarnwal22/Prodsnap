import type { Metadata } from "next"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import MentorshipClient from "./MentorshipClient"
import { MENTORSHIP_SERVICES } from "@/lib/constants"

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: "1:1 PM Mentorship & Mock Interviews with Ravi Barnwal | Prodsnap",
    description:
        "Book 1:1 product management mentorship — career strategy, full mock PM interviews and a line-by-line resume rewrite. Packages from ₹499, each bundled with free Prodsnap AI case practice.",
    keywords: [
        "PM mentorship",
        "product management mentor India",
        "PM mock interview",
        "product manager resume review",
        "1:1 PM career coaching",
        "PM interview coaching",
    ],
    alternates: { canonical: "/mentorship" },
    openGraph: {
        type: "profile",
        url: "https://prodsnap.in/mentorship",
        title: "1:1 PM Mentorship & Mock Interviews with Ravi Barnwal",
        description:
            "Career strategy, mock PM interviews and resume rewrites with a working product leader. Packages from ₹499.",
    },
}

// Offers are generated from the same constants the server charges against, so
// the price in the rich result can never drift from the price at checkout.
const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "1:1 Product Management Mentorship",
    serviceType: "Product management career mentorship and mock interviews",
    provider: { "@id": "https://prodsnap.in/#organization" },
    areaServed: "IN",
    url: "https://prodsnap.in/mentorship",
    offers: Object.entries(MENTORSHIP_SERVICES).map(([title, service]) => ({
        "@type": "Offer",
        name: title,
        price: service.priceINR,
        priceCurrency: "INR",
        category: `${service.sessions} session${service.sessions > 1 ? "s" : ""} · ${service.duration}`,
        url: "https://prodsnap.in/mentorship",
        availability: "https://schema.org/InStock",
    })),
}

export default function MentorshipPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col font-sans">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
            />
            <Header />
            <MentorshipClient />
            <Footer />
        </div>
    )
}
