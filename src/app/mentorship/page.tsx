import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import MentorshipClient from "./MentorshipClient"

export default function MentorshipPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col font-sans">
            <Header />
            <MentorshipClient />
            <Footer />
        </div>
    )
}
