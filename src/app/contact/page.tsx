import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Mail, MessageCircle, Linkedin } from "lucide-react"
import { ContactForm } from "./ContactForm"

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
            <Header />
            <main className="flex-grow py-12 md:py-24">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid lg:grid-cols-2 gap-16 items-start">

                        {/* Info Section */}
                        <div className="space-y-12">
                            <div>
                                <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
                                    Let&apos;s <span className="text-blue-600">Connect</span>
                                </h1>
                                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-lg leading-relaxed">
                                    Have feedback, inquiries, or just want to say hi? I&apos;d love to hear from you.
                                    Reach out through the form or my social handles.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <a
                                    href="mailto:support@prodsnap.in"
                                    className="flex items-center gap-6 p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group"
                                >
                                    <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <Mail size={28} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Email Me</p>
                                        <p className="text-lg font-bold">support@prodsnap.in</p>
                                    </div>
                                </a>

                                <a
                                    href="https://www.linkedin.com/in/barnwalravi/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-6 p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group"
                                >
                                    <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-[#0A66C2] group-hover:bg-[#0A66C2] group-hover:text-white transition-colors">
                                        <Linkedin size={28} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">LinkedIn</p>
                                        <p className="text-lg font-bold">in/barnwalravi</p>
                                    </div>
                                </a>
                            </div>

                            <div className="p-8 rounded-3xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                                    <MessageCircle className="text-blue-600" size={24} />
                                    Response Time
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Our team typically responds to emails within 24-48 hours. For urgent matters,
                                    reaching out on LinkedIn is usually faster.
                                </p>
                            </div>
                        </div>

                        {/* Form Section */}
                        <ContactForm />
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
