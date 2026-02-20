'use client'

import { useState } from 'react'
import { Trash2, ExternalLink, Search, CheckSquare, Square, Loader2, AlertCircle, RefreshCw, Zap } from 'lucide-react'
import { deleteJobs, cleanupInactiveJobs } from '@/app/jobs/actions'
import { useRouter } from 'next/navigation'

interface AdminJobListProps {
    jobs: any[]
}

export default function AdminJobList({ jobs }: AdminJobListProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [isDeleting, setIsDeleting] = useState(false)
    const [isCleaning, setIsCleaning] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const router = useRouter()

    const handleCleanup = async () => {
        if (!confirm('This will crawl through all active job links and remove those that are closed. This may take a minute. Continue?')) return;

        setIsCleaning(true)
        try {
            const res = await cleanupInactiveJobs()
            if (res.success) {
                alert(`Cleanup complete! Removed ${res.removedCount} inactive jobs.`);
                router.refresh()
            } else {
                alert('Cleanup failed: ' + res.error)
            }
        } catch (error) {
            alert('An error occurred during cleanup')
        } finally {
            setIsCleaning(false)
        }
    }

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredJobs.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(filteredJobs.map(j => j.id))
        }
    }

    const toggleSelect = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id))
        } else {
            setSelectedIds([...selectedIds, id])
        }
    }

    const handleDelete = async () => {
        if (selectedIds.length === 0) return
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} job(s)?`)) return

        setIsDeleting(true)
        try {
            const res = await deleteJobs(selectedIds)
            if (res.success) {
                setSelectedIds([])
                router.refresh()
            } else {
                alert('Failed to delete jobs')
            }
        } catch (error) {
            alert('An error occurred')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl overflow-hidden backdrop-blur-sm">
            {/* Header / Actions */}
            <div className="p-6 border-b border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search jobs or companies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl py-2.5 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleCleanup}
                        disabled={isCleaning}
                        className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl hover:bg-amber-500/20 transition-all font-bold text-sm disabled:opacity-50"
                    >
                        {isCleaning ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
                        {isCleaning ? 'Cleaning...' : 'Clean Stale Jobs'}
                    </button>

                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl hover:bg-red-500/20 transition-all font-bold text-sm"
                        >
                            {isDeleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                            Delete Selected ({selectedIds.length})
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                        <tr className="bg-gray-800/30 text-gray-400 text-[10px] uppercase tracking-widest font-black whitespace-nowrap">
                            <th className="px-6 py-4 w-12 text-center">
                                <button onClick={toggleSelectAll} className="hover:text-white transition-colors">
                                    {selectedIds.length === filteredJobs.length && filteredJobs.length > 0 ? (
                                        <CheckSquare size={18} className="text-blue-500" />
                                    ) : (
                                        <Square size={18} />
                                    )}
                                </button>
                            </th>
                            <th className="px-6 py-4">Job Details</th>
                            <th className="px-6 py-4">Company</th>
                            <th className="px-6 py-4">Posted</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {filteredJobs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">
                                    <div className="flex flex-col items-center gap-2">
                                        <AlertCircle size={32} className="opacity-20" />
                                        No jobs found matching your criteria.
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredJobs.map((job) => (
                                <tr key={job.id} className={`group hover:bg-gray-800/20 transition-colors ${selectedIds.includes(job.id) ? 'bg-blue-500/5' : ''}`}>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => toggleSelect(job.id)} className="text-gray-600 hover:text-blue-500 transition-colors">
                                            {selectedIds.includes(job.id) ? (
                                                <CheckSquare size={18} className="text-blue-500" />
                                            ) : (
                                                <Square size={18} />
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-white font-bold text-sm truncate max-w-[200px]">{job.title}</p>
                                            <p className="text-gray-500 text-[10px] uppercase font-black tracking-wider mt-0.5">{job.category} • {job.jobType}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-gray-300 font-semibold text-sm">{job.company}</p>
                                        <p className="text-gray-500 text-xs">{job.location}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-gray-400 text-xs font-medium">{(!job.postedAt || job.postedAt === 'Unknown') ? 'NA' : job.postedAt}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <a
                                                href={job.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all"
                                                title="Visit job page"
                                            >
                                                <ExternalLink size={16} />
                                            </a>
                                            <button
                                                onClick={() => {
                                                    setSelectedIds([job.id]);
                                                    handleDelete();
                                                }}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                title="Delete job"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-4 bg-gray-800/10 border-t border-gray-800 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                <span>Total: {filteredJobs.length} Jobs</span>
                {selectedIds.length > 0 && <span>Selected: {selectedIds.length}</span>}
            </div>
        </div>
    )
}
