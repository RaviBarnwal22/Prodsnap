import { Header } from "@/components/Header"

export default function Loading() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-20">
                <div className="mb-24 flex flex-col items-center">
                    <div className="w-48 h-6 bg-gray-100 dark:bg-gray-900 rounded-full mb-8 animate-pulse"></div>
                    <div className="w-1/2 h-16 bg-gray-100 dark:bg-gray-900 rounded-2xl mb-8 animate-pulse"></div>
                    <div className="w-1/3 h-6 bg-gray-100 dark:bg-gray-900 rounded-full animate-pulse"></div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-80 rounded-[2.5rem] bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-10 animate-pulse">
                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-3xl mb-8"></div>
                            <div className="w-3/4 h-8 bg-gray-200 dark:bg-gray-800 rounded-xl mb-4"></div>
                            <div className="w-full h-4 bg-gray-200 dark:bg-gray-800 rounded-full mb-2"></div>
                            <div className="w-1/2 h-4 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}
