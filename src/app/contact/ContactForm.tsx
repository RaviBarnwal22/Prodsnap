'use client'

import { useState } from 'react'
import { Send, CheckCircle2, Loader2 } from "lucide-react"
import { submitContactForm } from "@/app/actions"

export function ContactForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError("")

        const formData = new FormData(e.currentTarget)
        const name = formData.get('name') as string
        const email = formData.get('email') as string
        const message = formData.get('message') as string

        try {
            const result = await submitContactForm({ name, email, message })
            if (result.success) {
                setIsSubmitted(true)
            } else {
                setError(result.error || "Something went wrong. Please try again.")
            }
        } catch {
            setError("Failed to send message. Please check your connection.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="relative">
            <div className="bg-white dark:bg-gray-900 p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-blue-500/10 border border-gray-100 dark:border-gray-800 transition-all">
                {isSubmitted ? (
                    <div className="py-12 text-center space-y-6">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto text-green-600">
                            <CheckCircle2 size={48} />
                        </div>
                        <h2 className="text-3xl font-bold">Message Sent!</h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-xs mx-auto text-lg font-medium">
                            Thanks for reaching out. I&apos;ll get back to you as soon as possible.
                        </p>
                        <button
                            onClick={() => setIsSubmitted(false)}
                            className="text-blue-600 font-bold hover:underline"
                        >
                            Send another message
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="mb-10">
                            <h2 className="text-3xl font-bold mb-2">Send Feedback</h2>
                            <p className="text-gray-500 dark:text-gray-400">
                                Your feedback helps me improve Prodsnap for everyone.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
                                <input
                                    name="name"
                                    required
                                    type="text"
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-6 py-4 text-base focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Email ID</label>
                                <input
                                    name="email"
                                    required
                                    type="email"
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-6 py-4 text-base focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Message / Feedback</label>
                                <textarea
                                    name="message"
                                    required
                                    rows={5}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-6 py-4 text-base focus:ring-2 focus:ring-blue-500 transition-all outline-none resize-none"
                                    placeholder="What's on your mind?"
                                ></textarea>
                            </div>

                            {error && (
                                <div className="text-red-500 text-sm font-medium bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">
                                    {error}
                                </div>
                            )}

                            <button
                                disabled={isSubmitting}
                                className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="animate-spin" size={24} />
                                ) : (
                                    <>
                                        Send Message
                                        <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </>
                )}
            </div>

            {/* Decorative element */}
            <div className="absolute -z-10 -bottom-6 -right-6 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl"></div>
            <div className="absolute -z-10 -top-6 -left-6 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl"></div>
        </div>
    )
}
