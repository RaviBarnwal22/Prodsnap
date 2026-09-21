import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "PM Qualification Test | AI-Evaluated Product Manager Assessment",
    description:
        "Take the Prodsnap PM Qualification Test — timed product sense, metrics and strategy questions set in real Indian tech scenarios, evaluated instantly by AI.",
    keywords: [
        "PM qualification test",
        "product manager assessment",
        "PM aptitude test",
        "AI evaluated PM test",
        "product management test online",
    ],
    alternates: { canonical: "/exam" },
    openGraph: {
        url: "https://prodsnap.in/exam",
        title: "PM Qualification Test | AI-Evaluated Product Manager Assessment",
        description:
            "Timed product sense, metrics and strategy questions from real Indian tech scenarios, evaluated instantly by AI.",
    },
}

export default function ExamLayout({ children }: { children: React.ReactNode }) {
    return children
}
