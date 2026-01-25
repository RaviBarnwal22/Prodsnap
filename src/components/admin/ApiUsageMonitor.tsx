'use client';

import { useEffect, useState } from 'react';
import { Activity, TrendingUp, AlertTriangle, Zap, Database } from 'lucide-react';

interface ApiStats {
    total: number;
    success: number;
    error: number;
    rate_limit: number;
    capacity: number;
    model: string;
}

interface UsageData {
    stats: {
        gemini: ApiStats;
        perplexity: ApiStats;
    };
    dailyBreakdown: Record<string, { gemini: number; perplexity: number }>;
    responseTimeMap: Record<string, number>;
    recentErrors: Array<{
        provider: string;
        status: string;
        errorMessage: string | null;
        createdAt: string;
    }>;
    limits: {
        gemini: { free: number; model: string };
        perplexity: { free: number; model: string };
    };
}

export function ApiUsageMonitor() {
    const [data, setData] = useState<UsageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchUsageData();
        // Refresh every 30 seconds
        const interval = setInterval(fetchUsageData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchUsageData = async () => {
        try {
            const response = await fetch('/api/admin/api-usage');
            if (!response.ok) throw new Error('Failed to fetch API usage data');
            const result = await response.json();
            setData(result);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="bg-gray-800 rounded-2xl p-6 border border-red-500/30">
                <div className="flex items-center gap-3 text-red-400">
                    <AlertTriangle size={24} />
                    <div>
                        <h3 className="font-bold">Failed to Load API Usage Data</h3>
                        <p className="text-sm text-gray-400">{error || 'Unknown error'}</p>
                    </div>
                </div>
            </div>
        );
    }

    const { stats, dailyBreakdown, responseTimeMap, recentErrors, limits } = data;

    // Calculate usage percentages
    const geminiUsagePercent = (stats.gemini.total / stats.gemini.capacity) * 100;
    const perplexityUsagePercent = (stats.perplexity.total / stats.perplexity.capacity) * 100;

    // Prepare daily chart data (last 7 days)
    const dailyData = Object.entries(dailyBreakdown)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-7);

    const maxDailyUsage = Math.max(
        ...dailyData.map(([, counts]) => counts.gemini + counts.perplexity),
        1
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
                            <Database size={28} />
                            API Usage Monitor
                        </h2>
                        <p className="text-sm opacity-90">
                            Real-time tracking of Gemini & Perplexity API consumption
                        </p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md rounded-xl px-4 py-2">
                        <p className="text-xs font-bold uppercase tracking-widest opacity-80">Today</p>
                        <p className="text-3xl font-black">
                            {stats.gemini.total + stats.perplexity.total}
                        </p>
                        <p className="text-xs opacity-80">Total Requests</p>
                    </div>
                </div>
            </div>

            {/* Provider Cards */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Gemini Card */}
                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <Zap size={24} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white">Gemini API</h3>
                                <p className="text-xs text-gray-400">{stats.gemini.model}</p>
                            </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${geminiUsagePercent > 90 ? 'bg-red-500/20 text-red-400' :
                                geminiUsagePercent > 70 ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-green-500/20 text-green-400'
                            }`}>
                            {geminiUsagePercent.toFixed(1)}%
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-2">
                            <span>Usage: {stats.gemini.total} / {stats.gemini.capacity}</span>
                            <span>{stats.gemini.capacity - stats.gemini.total} remaining</span>
                        </div>
                        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${geminiUsagePercent > 90 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                        geminiUsagePercent > 70 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                            'bg-gradient-to-r from-green-500 to-emerald-500'
                                    }`}
                                style={{ width: `${Math.min(geminiUsagePercent, 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-gray-700/50 rounded-xl p-3">
                            <p className="text-2xl font-black text-green-400">{stats.gemini.success}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Success</p>
                        </div>
                        <div className="bg-gray-700/50 rounded-xl p-3">
                            <p className="text-2xl font-black text-red-400">{stats.gemini.error}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Errors</p>
                        </div>
                        <div className="bg-gray-700/50 rounded-xl p-3">
                            <p className="text-2xl font-black text-yellow-400">{stats.gemini.rate_limit}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Rate Limit</p>
                        </div>
                    </div>

                    {/* Response Time */}
                    {responseTimeMap.gemini !== undefined && (
                        <div className="mt-4 p-3 bg-blue-500/10 rounded-xl border border-blue-500/30">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-400">Avg Response Time</span>
                                <span className="text-lg font-black text-blue-400">{responseTimeMap.gemini}ms</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Perplexity Card */}
                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                                <Activity size={24} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white">Perplexity API</h3>
                                <p className="text-xs text-gray-400">{stats.perplexity.model}</p>
                            </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${perplexityUsagePercent > 90 ? 'bg-red-500/20 text-red-400' :
                                perplexityUsagePercent > 70 ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-green-500/20 text-green-400'
                            }`}>
                            {perplexityUsagePercent.toFixed(1)}%
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-2">
                            <span>Usage: {stats.perplexity.total}</span>
                            <span>Capacity: {stats.perplexity.capacity.toLocaleString()}</span>
                        </div>
                        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${perplexityUsagePercent > 90 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                        perplexityUsagePercent > 70 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                            'bg-gradient-to-r from-cyan-500 to-blue-500'
                                    }`}
                                style={{ width: `${Math.min(perplexityUsagePercent, 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-gray-700/50 rounded-xl p-3">
                            <p className="text-2xl font-black text-green-400">{stats.perplexity.success}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Success</p>
                        </div>
                        <div className="bg-gray-700/50 rounded-xl p-3">
                            <p className="text-2xl font-black text-red-400">{stats.perplexity.error}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Errors</p>
                        </div>
                        <div className="bg-gray-700/50 rounded-xl p-3">
                            <p className="text-2xl font-black text-yellow-400">{stats.perplexity.rate_limit}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Rate Limit</p>
                        </div>
                    </div>

                    {/* Response Time */}
                    {responseTimeMap.perplexity !== undefined && (
                        <div className="mt-4 p-3 bg-blue-500/10 rounded-xl border border-blue-500/30">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-400">Avg Response Time</span>
                                <span className="text-lg font-black text-blue-400">{responseTimeMap.perplexity}ms</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 7-Day Trend Chart */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-white">
                    <TrendingUp className="text-blue-400" size={20} />
                    7-Day Usage Trend
                </h3>
                <div className="flex items-end gap-2 h-48 px-4">
                    {dailyData.map(([date, counts], i) => {
                        const total = counts.gemini + counts.perplexity;
                        const geminiHeight = (counts.gemini / maxDailyUsage) * 100;
                        const perplexityHeight = (counts.perplexity / maxDailyUsage) * 100;
                        const dateObj = new Date(date);
                        const label = dateObj.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });

                        return (
                            <div key={i} className="flex-1 flex flex-col items-center group">
                                <div className="invisible group-hover:visible mb-2 px-2 py-1 bg-white text-gray-900 text-xs rounded-lg font-bold whitespace-nowrap">
                                    G: {counts.gemini} | P: {counts.perplexity}
                                </div>
                                <div className="w-full flex flex-col gap-1 items-center">
                                    {/* Gemini bar */}
                                    <div
                                        className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-lg transition-all duration-300 group-hover:opacity-100 opacity-80"
                                        style={{ height: `${Math.max(geminiHeight, 4)}%` }}
                                    />
                                    {/* Perplexity bar */}
                                    <div
                                        className="w-full bg-gradient-to-t from-cyan-500 to-blue-500 rounded-b-lg transition-all duration-300 group-hover:opacity-100 opacity-80"
                                        style={{ height: `${Math.max(perplexityHeight, 4)}%` }}
                                    />
                                </div>
                                <p className="text-xs font-bold text-gray-500 mt-3">{label}</p>
                            </div>
                        );
                    })}
                </div>
                <div className="flex items-center justify-center gap-6 mt-6">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-gradient-to-br from-purple-500 to-pink-500" />
                        <span className="text-xs font-bold text-gray-400">Gemini</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-gradient-to-br from-cyan-500 to-blue-500" />
                        <span className="text-xs font-bold text-gray-400">Perplexity</span>
                    </div>
                </div>
            </div>

            {/* Recent Errors */}
            {recentErrors.length > 0 && (
                <div className="bg-gray-800 rounded-2xl p-6 border border-red-500/30">
                    <h3 className="text-lg font-black mb-4 flex items-center gap-2 text-white">
                        <AlertTriangle className="text-red-400" size={20} />
                        Recent Errors & Rate Limits
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {recentErrors.map((error, i) => (
                            <div key={i} className="p-3 bg-gray-700/50 rounded-xl">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${error.status === 'rate_limit' ? 'bg-yellow-500' : 'bg-red-500'
                                            }`} />
                                        <span className="text-xs font-bold uppercase text-gray-400">
                                            {error.provider}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${error.status === 'rate_limit'
                                                ? 'bg-yellow-500/20 text-yellow-400'
                                                : 'bg-red-500/20 text-red-400'
                                            }`}>
                                            {error.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {new Date(error.createdAt).toLocaleTimeString()}
                                    </span>
                                </div>
                                {error.errorMessage && (
                                    <p className="text-xs text-gray-400 truncate">{error.errorMessage}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
