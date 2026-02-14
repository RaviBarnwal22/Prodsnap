'use client'

import { useState } from 'react'
import { Plus, Link as LinkIcon, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { addJobByUrl } from '@/app/jobs/actions'

export default function AdminJobAdder() {
    const [url, setUrl] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<{ success: boolean; message: string; job?: any } | null>(null)

    const handleAddJob = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!url) return

        setIsLoading(true)
        setResult(null)

        try {
            const res = await addJobByUrl(url)
            if (res.success) {
                setResult({
                    success: true,
                    message: `Successfully added: ${res.job.title} @ ${res.job.company}`,
                    job: res.job
                })
                setUrl('')
            } else {
                setResult({ success: false, message: res.error || 'Failed to add job' })
            }
        } catch (error) {
            setResult({ success: false, message: 'An unexpected error occurred' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Plus className="text-white" size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">AI Job Extractor</h2>
                    <p className="text-gray-400 text-sm font-medium">Paste a job URL and let Gemini do the heavy lifting</p>
                </div>
            </div>

            <form onSubmit={handleAddJob} className="space-y-6">
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors">
                        <LinkIcon size={20} />
                    </div>
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://job-boards.greenhouse.io/postman/jobs/..."
                        required
                        className="w-full bg-gray-800/50 border border-gray-700/50 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !url}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-900/20 active:scale-[0.98]"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Extracting AI Data...
                        </>
                    ) : (
                        <>
                            <Plus size={20} />
                            Add Job Posting
                        </>
                    )}
                </button>
            </form>

            {result && (
                <div className={`mt-8 p-6 rounded-2xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-300 ${result.success ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
                    }`}>
                    <div className="mt-1">
                        {result.success ? (
                            <CheckCircle2 className="text-green-500" size={20} />
                        ) : (
                            <AlertCircle className="text-red-500" size={20} />
                        )}
                    </div>
                    <div>
                        <p className={`font-bold ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                            {result.success ? 'Success!' : 'Error'}
                        </p>
                        <p className="text-sm text-gray-300 mt-1 leading-relaxed">
                            {result.message}
                        </p>
                        {result.job && (
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700/30">
                                    <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Company</p>
                                    <p className="text-white text-xs font-semibold">{result.job.company}</p>
                                </div>
                                <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700/30">
                                    <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Location</p>
                                    <p className="text-white text-xs font-semibold">{result.job.location}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
