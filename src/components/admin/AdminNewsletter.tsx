'use client'

import React, { useState } from 'react'
import { Send, Wand2, Mail, Loader2, CheckCircle2, AlertCircle, Eye, Edit3, Linkedin, RefreshCcw, Copy } from 'lucide-react'
import { generateNewsletterDraft, broadcastNewsletter, getLatestViralPost, generateViralLinkedInPostManual } from '@/app/actions'
import { marked } from 'marked'
import { useEffect } from 'react'

export function AdminNewsletter() {
    const [prompt, setPrompt] = useState('')
    const [subject, setSubject] = useState('')
    const [content, setContent] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')
    const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit')

    const [viralPost, setViralPost] = useState<any>(null)
    const [isGeneratingViral, setIsGeneratingViral] = useState(false)

    useEffect(() => {
        const fetchViral = async () => {
            const result = await getLatestViralPost();
            if (result.success && 'post' in result) {
                setViralPost(result.post)
            }
        }
        fetchViral()
    }, [])

    const handleGenerateViral = async () => {
        setIsGeneratingViral(true)
        try {
            const result = await generateViralLinkedInPostManual();
            if (result.success && 'post' in result) {
                setViralPost(result.post)
            } else {
                setMessage((result as any).error || 'Failed to generate viral post')
                setStatus('error')
            }
        } catch (err) {
            setStatus('error')
            setMessage('Something went wrong during viral generation')
        } finally {
            setIsGeneratingViral(false)
        }
    }

    const handleGenerate = async () => {
        if (!prompt) return
        setIsGenerating(true)
        setStatus('idle')

        try {
            const result = await generateNewsletterDraft(prompt)
            if (result.success) {
                setSubject(result.subject || '')
                setContent(result.content || '')
                setViewMode('edit')
            } else {
                setStatus('error')
                setMessage(result.error || 'Failed to generate draft')
            }
        } catch (err) {
            setStatus('error')
            setMessage('Something went wrong during generation')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleSend = async () => {
        if (!subject || !content) return
        if (!confirm('Are you sure you want to broadcast this newsletter to ALL subscribers?')) return

        setIsSending(true)
        setStatus('idle')

        try {
            const result = await broadcastNewsletter({ subject, content })
            if (result.success) {
                setStatus('success')
                setMessage(`Newsletter sent successfully to ${result.success} people!`)
                // Optional: clear form
                // setSubject('')
                // setContent('')
            } else {
                setStatus('error')
                setMessage(result.error || 'Failed to send newsletter')
            }
        } catch (err) {
            setStatus('error')
            setMessage('Something went wrong during broadcast')
        } finally {
            setIsSending(false)
        }
    }

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            {/* New Section: Daily Viral AI Post */}
            <div className="col-span-full mb-2 bg-gradient-to-br from-indigo-900/40 to-cyan-900/40 rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Linkedin size={120} />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                                <Linkedin size={20} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">Daily Viral Content</span>
                        </div>
                        <h2 className="text-3xl font-black text-white leading-tight">LinkedIn AI Storyteller</h2>
                        <p className="text-gray-400 font-medium max-w-xl">
                            Automatically researched AI breakthroughs optimized for viral storytelling. Updates daily at 9:00 AM IST.
                        </p>
                    </div>

                    <button
                        onClick={handleGenerateViral}
                        disabled={isGeneratingViral}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all disabled:opacity-50 shadow-xl"
                    >
                        {isGeneratingViral ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
                        Manual Refresh
                    </button>
                </div>

                <div className="mt-10 grid gap-6 relative z-10">
                    {viralPost ? (
                        <div className="bg-gray-950/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white shadow-lg">
                                        PS
                                    </div>
                                    <div>
                                        <div className="text-white font-bold flex items-center gap-2">
                                            Prodsnap AI Digest <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full uppercase tracking-widest leading-none">Author</span>
                                        </div>
                                        <div className="text-xs text-gray-500 font-medium">{viralPost.date} • Featured AI Research</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(viralPost.content);
                                        alert("Copied to clipboard!");
                                    }}
                                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-colors"
                                >
                                    <Copy size={18} />
                                </button>
                            </div>

                            <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-sans max-h-[400px] overflow-auto scrollbar-hide">
                                {viralPost.content}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed border-gray-700 rounded-3xl">
                            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4 text-gray-600">
                                <Linkedin size={32} />
                            </div>
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No LinkedIn post generated yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Left Column: Creator/Editor */}
            <div className="space-y-6">
                <div className="bg-gray-800 rounded-3xl p-8 border border-gray-700 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center text-violet-400">
                            <Wand2 size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white">AI Newsletter Draft</h2>
                            <p className="text-sm text-gray-500 font-medium">Draft your weekly digest with AI</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                                Context/Topic
                            </label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g. Write about Apple's new AI agents announced yesterday and how PMs should rethink their mobile strategies."
                                className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 min-h-[100px] text-sm"
                            />
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !prompt}
                            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Drafting your newsletter...
                                </>
                            ) : (
                                <>
                                    <Wand2 size={18} />
                                    Generate Draft
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="bg-gray-800 rounded-3xl p-8 border border-gray-700 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                                <Edit3 size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white">Full Editor</h2>
                                <p className="text-sm text-gray-500 font-medium">Refine subject and body</p>
                            </div>
                        </div>
                        <div className="flex bg-gray-900 rounded-xl p-1 p-1 border border-gray-700">
                            <button
                                onClick={() => setViewMode('edit')}
                                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'edit' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                            >
                                <Edit3 size={14} className="inline mr-2" />
                                Edit
                            </button>
                            <button
                                onClick={() => setViewMode('preview')}
                                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'preview' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                            >
                                <Eye size={14} className="inline mr-2" />
                                Preview
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {viewMode === 'edit' ? (
                            <>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Subject Line</label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="Subject of your newsletter"
                                        className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Body (Markdown)</label>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Write your newsletter here... Use Markdown for formatting."
                                        className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[300px] font-mono text-sm leading-relaxed"
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4 animate-fadeIn">
                                <div className="p-4 bg-gray-900 border border-gray-700 rounded-2xl">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Subject</div>
                                    <div className="text-white font-bold">{subject || "(No Subject)"}</div>
                                </div>
                                <div className="p-4 bg-gray-900 border border-gray-700 rounded-2xl min-h-[300px]">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Content Preview</div>
                                    <div
                                        className="text-gray-300 prose prose-invert prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{
                                            __html: marked.parse(content || "_No content yet_") as string
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleSend}
                            disabled={isSending || !subject || !content}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSending ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Broadcasting to subscribers...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    Send Bulk Newsletter
                                </>
                            )}
                        </button>

                        {status === 'success' && (
                            <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-2xl flex items-center gap-3 text-green-400">
                                <CheckCircle2 size={18} />
                                <span className="text-sm font-bold">{message}</span>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-400">
                                <AlertCircle size={18} />
                                <span className="text-sm font-bold">{message}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Column: Preview */}
            <div className="space-y-6">
                <div className="bg-gray-800 rounded-3xl border border-gray-700 shadow-2xl h-full flex flex-col overflow-hidden">
                    <div className="bg-gray-900 p-6 border-b border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
                                <Mail size={20} />
                            </div>
                            <h3 className="font-black text-white uppercase tracking-widest text-sm">Inbox Preview</h3>
                        </div>
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                            <div className="w-3 h-3 rounded-full bg-amber-500/20"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
                        </div>
                    </div>

                    <div className="p-8 flex-grow overflow-auto bg-white text-gray-900">
                        <div className="max-w-md mx-auto">
                            <div className="border-b border-gray-100 pb-4 mb-6">
                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Subject</div>
                                <div className="text-lg font-black text-gray-900 leading-tight">
                                    {subject || "Weekly Prodsnap Update"}
                                </div>
                            </div>

                            <div className="prose prose-sm prose-slate max-w-none">
                                {/* Sample Header */}
                                <div className="bg-violet-600 rounded-xl p-6 text-white mb-8 text-center shadow-lg">
                                    <h1 className="text-xl font-black m-0 mb-1">Prod<span className="opacity-70">snap</span> Digest</h1>
                                    <p className="text-[10px] uppercase font-black tracking-widest opacity-70 m-0">Weekly Intelligence</p>
                                </div>

                                {/* Dynamic Content Preview */}
                                <div
                                    className="font-sans leading-relaxed text-gray-800"
                                    dangerouslySetInnerHTML={{
                                        __html: marked.parse(content || "Generating content or waiting for your input...") as string
                                    }}
                                />

                                <hr className="my-8 border-gray-100" />

                                <p className="text-[10px] text-gray-400 text-center font-medium leading-relaxed">
                                    You are receiving this because you subscribed to Prodsnap or registered on our platform.<br />
                                    <span className="underline cursor-pointer">Unsubscribe</span> | <span className="underline cursor-pointer">View Online</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
