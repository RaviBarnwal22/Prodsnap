import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <p className="text-5xl font-bold text-gray-900 mb-2">404</p>
                <h1 className="text-xl font-semibold text-gray-900 mb-2">Page not found</h1>
                <p className="text-gray-600 mb-6">
                    The page you&apos;re looking for doesn&apos;t exist or has moved.
                </p>
                <div className="flex gap-3 justify-center">
                    <Link
                        href="/"
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:opacity-90 transition"
                    >
                        Go home
                    </Link>
                    <Link
                        href="/practice"
                        className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
                    >
                        Browse practice
                    </Link>
                </div>
            </div>
        </div>
    )
}
