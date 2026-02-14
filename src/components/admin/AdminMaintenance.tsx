'use client'

import { useState } from 'react'
import { Zap, Newspaper, Briefcase, RefreshCw, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react'
import { refreshJobs } from '@/app/jobs/actions'
import { refreshAINews } from '@/app/ai-news/actions'

export function AdminMaintenance() {
    const [isRefreshingJobs, setIsRefreshingJobs] = useState(false)
    const [isRefreshingNews, setIsRefreshingNews] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const handleRefreshJobs = async () => {
        setIsRefreshingJobs(true)
        setMessage(null)
        try {
            const result = await refreshJobs()
            if (result.success) {
                setMessage({ type: 'success', text: `Successfully refreshed jobs! Found ${result.count} new opportunities.` })
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to refresh jobs.' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An unexpected error occurred while refreshing jobs.' })
        } finally {
            setIsRefreshingJobs(false)
        }
    }

    const handleRefreshNews = async () => {
        setIsRefreshingNews(true)
        setMessage(null)
        try {
            const result = await refreshAINews()
            if (result.success) {
                setMessage({ type: 'success', text: `Successfully refreshed AI news! Added ${result.count} new articles.` })
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to refresh AI news.' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An unexpected error occurred while refreshing AI news.' })
        } finally {
            setIsRefreshingNews(false)
        }
    }

    return (
        <div className="space-y-8">
            <div className="bg-gray-800 rounded-3xl p-8 border border-gray-700 shadow-xl">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                        <Zap size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white">System Maintenance</h2>
                        <p className="text-gray-400 font-medium">Manually trigger data synchronization and AI scraping.</p>
                    </div>
                </div>

                {message && (
                    <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 border ${message.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                        }`}>
                        {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        <p className="font-bold text-sm">{message.text}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Refresh Jobs Card */}
                    <div className="p-6 bg-gray-900/50 rounded-2xl border border-gray-700 hover:border-blue-500/50 transition-all group">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                <Briefcase size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-white">Product Job Board</h3>
                        </div>
                        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                            Scrape global ATS (Greenhouse, Lever, etc.) for new deep-linked PM roles using Perplexity AI. This process usually takes 2-3 minutes.
                        </p>
                        <button
                            onClick={handleRefreshJobs}
                            disabled={isRefreshingJobs}
                            className="w-full h-14 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-xl font-black flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                        >
                            {isRefreshingJobs ? (
                                <>
                                    <RefreshCw className="animate-spin" size={20} />
                                    Scraping Roles...
                                </>
                            ) : (
                                <>
                                    <RefreshCw size={20} />
                                    Refresh Job Board
                                </>
                            )}
                        </button>
                    </div>

                    {/* Refresh News Card */}
                    <div className="p-6 bg-gray-900/50 rounded-2xl border border-gray-700 hover:border-violet-500/50 transition-all group">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                                <Newspaper size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-white">AI Daily Digest</h3>
                        </div>
                        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                            Gather the latest AI news and generate PM-specific perspectives. Scrapes verified sources and uses Perplexity for curation.
                        </p>
                        <button
                            onClick={handleRefreshNews}
                            disabled={isRefreshingNews}
                            className="w-full h-14 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:hover:bg-violet-600 text-white rounded-xl font-black flex items-center justify-center gap-3 transition-all shadow-lg shadow-violet-500/20 active:scale-95"
                        >
                            {isRefreshingNews ? (
                                <>
                                    <RefreshCw className="animate-spin" size={20} />
                                    Generating Digest...
                                </>
                            ) : (
                                <>
                                    <RefreshCw size={20} />
                                    Refresh AI News
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl">
                <div className="flex items-center gap-3 text-amber-500 mb-2 font-black uppercase tracking-widest text-xs">
                    <Sparkles size={16} fill="currentColor" />
                    Pro Tip
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                    These operations utilize the <span className="text-gray-200 font-bold underline decoration-amber-500/40">Perplexity AI API</span>. Avoid spamming the refresh buttons as it may lead to rate limiting on your API key. One refresh per day is usually sufficient as the system also runs on an automated cron schedule at 5:30 AM IST.
                </p>
            </div>
        </div>
    )
}
