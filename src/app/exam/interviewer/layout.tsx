import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "AI Interviewer Session | Prodsnap",
    robots: { index: false, follow: false },
}

export default function InterviewerLayout({ children }: { children: React.ReactNode }) {
    return children
}
