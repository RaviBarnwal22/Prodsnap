'use client'

import { AlertCircle, RefreshCw, ArrowLeft, List } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ErrorModalProps {
    isOpen: boolean
    onClose: () => void
    errorMessage?: string
}

export function ErrorModal({ isOpen, onClose, errorMessage }: ErrorModalProps) {
    const router = useRouter()

    if (!isOpen) return null

    const handleRefresh = () => {
        window.location.reload()
    }

    const handleGoBack = () => {
        router.back()
    }

    const handleTryAnother = () => {
        router.push('/practice')
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                            <AlertCircle className="text-white" size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white">Oops! Something Went Wrong</h2>
                            <p className="text-red-100 text-sm">Don't worry, we've got you covered</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                        <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                            {errorMessage || "We encountered an unexpected error while processing your submission."}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                            Here's what you can do:
                        </p>

                        {/* Action Buttons */}
                        <button
                            onClick={handleRefresh}
                            className="w-full flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                                <RefreshCw className="text-white" size={18} />
                            </div>
                            <div className="text-left flex-1">
                                <p className="font-bold text-gray-900 dark:text-white text-sm">Refresh & Try Again</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Reload the page and resubmit your answer</p>
                            </div>
                        </button>

                        <button
                            onClick={handleTryAnother}
                            className="w-full flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group"
                        >
                            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                                <List className="text-white" size={18} />
                            </div>
                            <div className="text-left flex-1">
                                <p className="font-bold text-gray-900 dark:text-white text-sm">Try Another Question</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Browse other practice questions</p>
                            </div>
                        </button>

                        <button
                            onClick={handleGoBack}
                            className="w-full flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                        >
                            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                                <ArrowLeft className="text-white" size={18} />
                            </div>
                            <div className="text-left flex-1">
                                <p className="font-bold text-gray-900 dark:text-white text-sm">Go Back</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Return to the previous page</p>
                            </div>
                        </button>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                            <span className="font-bold">💡 Pro Tip:</span> If this error persists, try clearing your browser cache or contact support at <a href="mailto:info.prodsnap@gmail.com" className="text-blue-600 dark:text-blue-400 font-bold underline">info.prodsnap@gmail.com</a>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    )
}
