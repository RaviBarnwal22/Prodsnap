export default function BlogPostLoading() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 px-4 pt-32 pb-20" aria-busy="true">
            <div className="max-w-3xl mx-auto animate-pulse space-y-4">
                <div className="h-5 w-32 rounded-full bg-gray-100 dark:bg-gray-800" />
                <div className="h-12 w-full rounded bg-gray-100 dark:bg-gray-800" />
                <div className="h-6 w-3/4 rounded bg-gray-100 dark:bg-gray-800" />
                <div className="aspect-[1200/630] rounded-3xl bg-gray-100 dark:bg-gray-800" />
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-4 w-full rounded bg-gray-100 dark:bg-gray-800" />
                ))}
            </div>
        </div>
    )
}
