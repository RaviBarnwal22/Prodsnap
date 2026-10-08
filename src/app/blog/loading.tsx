export default function BlogLoading() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 px-4 pt-32 pb-20" aria-busy="true">
            <div className="max-w-6xl mx-auto animate-pulse">
                <div className="h-4 w-40 rounded bg-gray-100 dark:bg-gray-800" />
                <div className="mt-4 h-12 w-2/3 rounded bg-gray-100 dark:bg-gray-800" />
                <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                            <div className="aspect-[1200/630] bg-gray-100 dark:bg-gray-800" />
                            <div className="p-5 space-y-2">
                                <div className="h-5 w-4/5 rounded bg-gray-100 dark:bg-gray-800" />
                                <div className="h-4 w-full rounded bg-gray-100 dark:bg-gray-800" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
