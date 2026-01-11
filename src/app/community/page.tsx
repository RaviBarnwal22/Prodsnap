import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import Link from "next/link"
import { Users, MessageCircle, BookOpen, Briefcase, ArrowRight, CheckCircle, Star } from "lucide-react"

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

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col font-sans">
            <Header />

            <main className="flex-grow pt-20">
                {/* Hero Section */}
                <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 py-20 md:py-32 px-4">
                    {/* Background decoration */}
                    <div className="absolute top-20 right-10 w-72 h-72 bg-green-400/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl"></div>

                    <div className="container mx-auto max-w-5xl text-center relative z-10">

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 text-gray-900 dark:text-white leading-[1.1]">
                            Join Our <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500">WhatsApp Community</span>
                        </h1>

                        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Connect with fellow PM aspirants, get exclusive job updates, access premium resources, and accelerate your Product Management career.
                        </p>

                        <a
                            href="https://chat.whatsapp.com/JYgbtlHtD2BGinjpdADJXG"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-10 py-5 rounded-full font-black text-lg hover:shadow-xl hover:shadow-green-500/30 transition-all group"
                        >
                            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Join WhatsApp Community
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </a>

                        <p className="text-sm text-gray-500 mt-4">Free to join • No spam • Moderated by PM experts</p>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-20 px-4 bg-white dark:bg-gray-950">
                    <div className="container mx-auto max-w-6xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-black mb-4">What You'll Get</h2>
                            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                                Our community is designed to help you succeed in your PM journey
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {benefits.map((benefit, i) => (
                                <div key={i} className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow">
                                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl flex items-center justify-center mb-4">
                                        {benefit.icon}
                                    </div>
                                    <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{benefit.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features List */}
                <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900/50">
                    <div className="container mx-auto max-w-4xl">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 dark:border-gray-700">
                            <h2 className="text-2xl md:text-3xl font-black mb-8 text-center">Community Perks</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                {features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <CheckCircle size={20} className="text-green-500 shrink-0" />
                                        <span className="font-medium">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 px-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600">
                    <div className="container mx-auto max-w-3xl text-center text-white">
                        <h2 className="text-3xl md:text-4xl font-black mb-6">Ready to Accelerate Your PM Career?</h2>
                        <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                            Join hundreds of PM aspirants who are learning, networking, and landing their dream roles together.
                        </p>
                        <a
                            href="https://chat.whatsapp.com/JYgbtlHtD2BGinjpdADJXG"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 bg-white text-green-600 px-10 py-5 rounded-full font-black text-lg hover:shadow-xl transition-all group"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Join Now - It's Free!
                        </a>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
