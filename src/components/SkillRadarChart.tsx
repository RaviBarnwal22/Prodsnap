'use client'

import React, { useEffect, useState } from 'react'
import {
    Radar, RadarChart, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts'
import { getUserSkillScores } from '@/app/actions'
import { Target, TrendingUp, Info } from 'lucide-react'
import { motion } from 'framer-motion'

export function SkillRadarChart() {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const resp = await getUserSkillScores()
                if (resp.success && resp.scores) {
                    // Normalize data to ensure 'score' key exists
                    const normalized = resp.scores.map((s: any) => ({
                        ...s,
                        score: s.score !== undefined ? s.score : s.A
                    }))
                    setData(normalized)
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="h-[300px] w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!data || data.length === 0) {
        return (
            <div className="p-8 text-center bg-violet-50 dark:bg-violet-900/10 rounded-3xl border border-violet-100 dark:border-violet-900/30">
                <Target className="mx-auto text-violet-500 mb-4" size={40} />
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">No Performance Data Yet</h4>
                <p className="text-sm text-gray-500">Practice at least one case to see your skill matrix.</p>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 p-5 rounded-3xl border shadow-sm"
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                        Skill Matrix <TrendingUp size={18} className="text-emerald-500" />
                    </h3>
                    <p className="text-sm text-gray-500 font-bold lowercase tracking-wider">Based on last 10 cases</p>
                </div>
                <div className="bg-violet-100 dark:bg-violet-900/30 p-2 rounded-xl text-violet-600 dark:text-violet-400 cursor-help group relative">
                    <Info size={16} />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 text-[10px] text-white p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none shadow-2xl leading-relaxed">
                        This chart visualizes your product management proficiency across core dimensions as evaluated by our AI.
                    </div>
                </div>
            </div>

            <div className="h-[320px] w-full px-4">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 800 }}
                        />
                        <PolarRadiusAxis
                            angle={30}
                            domain={[0, 5]}
                            tick={false}
                            axisLine={false}
                        />
                        <Radar
                            name="Skills"
                            dataKey="score"
                            stroke="#7C3AED"
                            strokeWidth={3}
                            fill="#7C3AED"
                            fillOpacity={0.2}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* Detailed Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                {data.map((item) => (
                    <div key={item.subject} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                        <span className="text-xs font-black text-gray-500 uppercase tracking-tight">{item.subject}</span>
                        <span className="text-base font-black text-violet-600 dark:text-violet-400">{item.score}/5</span>
                    </div>
                ))}
            </div>
        </motion.div>
    )
}
