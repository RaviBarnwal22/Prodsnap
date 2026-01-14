export const dynamic = "force-dynamic"
import { prisma } from "@/lib/prisma"
import { Header } from "@/components/Header"
import { Briefcase, Star } from "lucide-react"

export default async function MentorsPage() {
    const experts = await prisma.expertProfile.findMany({
        include: {
            user: true
        }
    })

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Verified Mentors</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Learn from top Product Managers who have built for India&apos;s scale.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {experts.map((expert) => (
                        <div key={expert.id} className="bg-white dark:bg-gray-900 border rounded-lg p-6 shadow-sm hover:shadow-md transition">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl font-bold">
                                    {expert.user.firstName?.[0]}{expert.user.lastName?.[0]}
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">{expert.user.firstName} {expert.user.lastName}</h2>
                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                        <Briefcase size={14} /> {expert.role} at {expert.company}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
                                <div className="flex items-center gap-1">
                                    <Star size={14} className="text-yellow-400 fill-yellow-400" /> 4.9 (24 reviews)
                                </div>
                                <div>{expert.experienceYears}+ years exp.</div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-lg font-bold">₹{expert.hourlyRateINR}/hr</span>
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition">
                                    Book Session
                                </button>
                            </div>
                        </div>
                    ))}

                    {experts.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-500 bg-white dark:bg-gray-900 border border-dashed rounded-lg">
                            <p className="mb-4">No mentors available at the moment.</p>
                            <p className="text-sm">We&apos;re onboarding top PMs from Swiggy, Flipkart, and more. Stay tuned!</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
