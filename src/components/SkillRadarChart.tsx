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
                    setData(resp.scores)
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
            className="bg-white dark:bg-gray-900 p-6 rounded-3xl border shadow-sm"
        >
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                        Skill Matrix <TrendingUp size={18} className="text-emerald-500" />
                    </h3>
                    <p className="text-xs text-gray-500 font-medium lowercase tracking-wider">Based on last 10 cases</p>
                </div>
                <div className="bg-violet-100 dark:bg-violet-900/30 p-2 rounded-xl text-violet-600 dark:text-violet-400 cursor-help group relative">
                    <Info size={16} />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 text-[10px] text-white p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none shadow-2xl leading-relaxed">
                        This chart visualizes your product management proficiency across core dimensions as evaluated by our AI.
                    </div>
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                        />
                        <PolarRadiusAxis
                            angle={30}
                            domain={[0, 5]}
                            tick={false}
                            axisLine={false}
                        />
                        <Radar
                            name="Skills"
                            dataKey="A"
                            stroke="#7c3aed"
                            strokeWidth={3}
                            fill="#7c3aed"
                            fillOpacity={0.3}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
                {data.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                        <span className="text-[10px] font-bold text-gray-500 uppercase truncate pr-2">{item.subject}</span>
                        <span className="text-sm font-black text-violet-600 dark:text-violet-400">{item.A}/5</span>
                    </div>
                ))}
            </div>
        </motion.div>
    )
}
