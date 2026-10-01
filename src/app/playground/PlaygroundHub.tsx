'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Trophy } from 'lucide-react'
import type { PlaygroundCategory } from '@/lib/playground/categories'
import type { PlaygroundProgress } from '@/lib/playground/types'
import { loadProgress } from '@/lib/playground/progress'

interface HubCategory extends PlaygroundCategory {
    sectionKeys: string[]
    questionCount: number
}

export function PlaygroundHub({ categories }: { categories: HubCategory[] }) {
    const [progress, setProgress] = useState<PlaygroundProgress>({ xp: 0, categories: {} })
    useEffect(() => setProgress(loadProgress()), [])

    const masteredCount = categories.filter(c =>
        c.sectionKeys.length && c.sectionKeys.every(k => (progress.categories[c.slug]?.[k]?.stars ?? 0) >= 1)
    ).length

    return (
        <div>
            {/* Hero */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                <motion.div className="inline-block text-6xl mb-4" animate={{ rotate: [0, -10, 10, -5, 0], scale: [1, 1.1, 1] }} transition={{ duration: 1.4, delay: 0.2 }}>🎮</motion.div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                    PM <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">Playground</span>
                </h1>
                <p className="mt-3 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Learn how to crack every type of PM interview case, one step at a time. Short lessons, quick questions from real cases. <span className="font-bold text-gray-900 dark:text-white">No typing.</span>
                </p>

                {(progress.xp > 0 || masteredCount > 0) && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-6 inline-flex items-center gap-5 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3">
                        <span className="inline-flex items-center gap-1.5 font-black"><Zap size={18} className="text-amber-400" />{progress.xp} XP</span>
                        <span className="w-px h-5 bg-white/20 dark:bg-gray-900/20" />
                        <span className="inline-flex items-center gap-1.5 font-black"><Trophy size={18} className="text-amber-400" />{masteredCount}/{categories.length} mastered</span>
                    </motion.div>
                )}
            </motion.div>

            {/* How it works, in plain English, before anyone picks a category */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
                {[
                    { e: '🗂️', t: 'Pick a case type', d: 'Each one needs a different method' },
                    { e: '📖', t: 'Learn one step', d: '60 second lesson per step' },
                    { e: '👆', t: 'Answer 8 questions', d: 'Just click. From real cases.' },
                    { e: '⭐', t: 'Unlock the next', d: 'Master all 6 steps' },
                ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.08 }} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 text-center">
                        <div className="text-3xl mb-2">{s.e}</div>
                        <p className="font-black text-sm text-gray-900 dark:text-white">{i + 1}. {s.t}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.d}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Categories */}
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-4">Choose a case type</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((c, i) => {
                    const cp = progress.categories[c.slug] || {}
                    const done = c.sectionKeys.filter(k => (cp[k]?.stars ?? 0) >= 1).length
                    const stars = c.sectionKeys.reduce((n, k) => n + (cp[k]?.stars ?? 0), 0)
                    const pct = c.sectionKeys.length ? (done / c.sectionKeys.length) * 100 : 0
                    const available = c.sectionKeys.length > 0
                    const card = (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + i * 0.05 }}
                            whileHover={available ? { y: -4 } : undefined}
                            className={`h-full rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm ${available ? 'hover:shadow-xl' : 'opacity-60'} transition`}
                        >
                            <div className={`bg-gradient-to-br ${c.gradient} p-5 text-white relative`}>
                                <span className="text-4xl">{c.emoji}</span>
                                {done === c.sectionKeys.length && available && (
                                    <span className="absolute top-4 right-4 bg-white/25 backdrop-blur text-xs font-black px-2 py-1 rounded-lg">🏆 Mastered</span>
                                )}
                                <h3 className="text-xl font-black mt-2">{c.title}</h3>
                                <p className="text-sm text-white/85">{c.tagline}</p>
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                                    <span>{done}/{c.sectionKeys.length} steps · ⭐ {stars}</span>
                                    <span>{c.questionCount} questions</span>
                                </div>
                                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <motion.div className={`h-full bg-gradient-to-r ${c.gradient}`} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.5, duration: 0.8 }} />
                                </div>
                                <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-black text-violet-600 dark:text-violet-400">
                                    {!available ? 'Coming soon' : done === 0 ? 'Start' : 'Continue'} {available && <ArrowRight size={14} />}
                                </p>
                            </div>
                        </motion.div>
                    )
                    return available
                        ? <Link key={c.slug} href={`/playground/${c.slug}`}>{card}</Link>
                        : <div key={c.slug}>{card}</div>
                })}
            </div>
        </div>
    )
}
