import { Header } from "@/components/Header"
import { Sparkles } from "lucide-react"

export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Header />
            <main className="container mx-auto px-4 py-8 grid md:grid-cols-3 gap-8">
                {/* Left Column Skeleton */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border shadow-sm sticky top-24 animate-pulse">
                        <div className="w-20 h-4 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
                        <div className="w-3/4 h-8 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
                        <div className="space-y-2">
                            <div className="w-full h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                            <div className="w-full h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                            <div className="w-1/2 h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                        </div>
                        <div className="mt-8 pt-6 border-t">
                            <div className="w-16 h-4 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
                            <div className="space-y-2">
                                <div className="w-full h-3 bg-gray-200 dark:bg-gray-800 rounded"></div>
                                <div className="w-full h-3 bg-gray-200 dark:bg-gray-800 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column Skeleton */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border shadow-sm h-[500px] flex flex-col items-center justify-center text-center">
                        <div className="relative w-16 h-16 mb-6">
                            <div className="absolute inset-0 border-4 border-violet-100 dark:border-violet-900/30 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 mb-2">
                            Preparing Your Challenge
                        </h3>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto">
                            Setting up the workspace and expert guidelines...
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}
