'use client';

import { useEffect, useState } from 'react';
import { Activity, TrendingUp, AlertTriangle, Zap, Database, Download } from 'lucide-react';

interface ApiStats {
    total: number;
    success?: number;
    error?: number;
    rate_limit?: number;
    capacity: number;
    model: string;
}

interface UsageData {
    stats: {
        gemini: ApiStats;
        perplexity: ApiStats;
        email: ApiStats;
    };
    dailyBreakdown: Record<string, { gemini: number; perplexity: number; email: number }>;
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
        email: { free: number; model: string };
    };
}

export function ApiUsageMonitor() {
    const [data, setData] = useState<UsageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchUsageData();
        // Refresh every 30 seconds if looking at today
        const interval = setInterval(() => {
            const today = new Date().toISOString().split('T')[0];
            if (startDate === today && endDate === today) {
                fetchUsageData();
            }
        }, 30000);
        return () => clearInterval(interval);
    }, [startDate, endDate]);

    const fetchUsageData = async () => {
        try {
            const url = `/api/admin/api-usage?startDate=${startDate}&endDate=${endDate}`;
            const response = await fetch(url);
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Failed to fetch API usage data');
            }
            const result = await response.json();
            setData(result);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            window.location.href = `/api/admin/export-usage?startDate=${startDate}&endDate=${endDate}`;
        } catch (err) {
            alert('Failed to export data');
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
    const emailUsagePercent = (stats.email.total / stats.email.capacity) * 100;

    // Prepare daily chart data (last 7 days)
    const dailyData = Object.entries(dailyBreakdown)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-7);

    const maxDailyUsage = Math.max(
        ...dailyData.map(([, counts]) => counts.gemini + counts.perplexity + counts.email),
        1
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black mb-2 flex items-center justify-center md:justify-start gap-2">
                            <Database size={28} />
                            API & Mail Monitor
                        </h2>
                        <p className="text-sm opacity-90">
                            Real-time tracking of Gemini, Perplexity, and Brevo Email limits
                        </p>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase opacity-60">From</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase opacity-60">To</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                            />
                        </div>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl transition-all font-bold text-sm border border-white/10 mt-4 md:mt-0"
                        >
                            <Download size={18} />
                            Export Data
                        </button>
                        <div className="bg-white/20 backdrop-blur-md rounded-xl px-4 py-2 min-w-[140px]">
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                                {startDate === endDate ? 'Selected Date' : 'Period'} Load
                            </p>
                            <p className="text-3xl font-black">
                                {stats.gemini.total + stats.perplexity.total + stats.email.total}
                            </p>
                            <p className="text-[10px] opacity-80">Total Requests + Mails</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6">
                {/* Gemini Card */}
                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <Zap size={24} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white">Gemini</h3>
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">AI Logic</p>
                            </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-[10px] font-black ${geminiUsagePercent > 90 ? 'bg-red-500/20 text-red-400' :
                            geminiUsagePercent > 70 ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-green-500/20 text-green-400'
                            }`}>
                            {geminiUsagePercent.toFixed(1)}%
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-[10px] text-gray-400 mb-2 font-bold uppercase">
                                <span>Used: {stats.gemini.total}</span>
                                <span>Cap: {stats.gemini.capacity}</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-1000 ${geminiUsagePercent > 90 ? 'bg-red-500' : geminiUsagePercent > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                    style={{ width: `${Math.min(geminiUsagePercent, 100)}%` }}
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Response</span>
                            <span className="text-blue-400 font-black">{responseTimeMap.gemini || '--'}ms</span>
                        </div>
                    </div>
                </div>

                {/* Perplexity Card */}
                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                                <Activity size={24} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white">Perplexity</h3>
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Fallback Engine</p>
                            </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-[10px] font-black ${perplexityUsagePercent > 90 ? 'bg-red-500/20 text-red-400' :
                            perplexityUsagePercent > 70 ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-green-500/20 text-green-400'
                            }`}>
                            {perplexityUsagePercent.toFixed(1)}%
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-[10px] text-gray-400 mb-2 font-bold uppercase">
                                <span>Used: {stats.perplexity.total}</span>
                                <span>Cap: {stats.perplexity.capacity}</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-1000 bg-cyan-500`}
                                    style={{ width: `${Math.min(perplexityUsagePercent, 100)}%` }}
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Response</span>
                            <span className="text-cyan-400 font-black">{responseTimeMap.perplexity || '--'}ms</span>
                        </div>
                    </div>
                </div>

                {/* Brevo Card */}
                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                                <TrendingUp size={24} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white">Brevo Mail</h3>
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">SMTP Relay</p>
                            </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-[10px] font-black ${emailUsagePercent > 90 ? 'bg-red-500/20 text-red-400' :
                            emailUsagePercent > 70 ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-green-500/20 text-green-400'
                            }`}>
                            {emailUsagePercent.toFixed(1)}%
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-[10px] text-gray-400 mb-2 font-bold uppercase">
                                <span>Sent: {stats.email.total}</span>
                                <span>Daily Limit: {stats.email.capacity}</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-1000 ${emailUsagePercent > 90 ? 'bg-red-500' : 'bg-orange-500'}`}
                                    style={{ width: `${Math.min(emailUsagePercent, 100)}%` }}
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-orange-400 font-black">
                            <span>Ready</span>
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Live
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Usage Chart */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-white">
                    <Activity className="text-blue-400" size={20} />
                    Historical Volume (Last 7 Days)
                </h3>
                <div className="flex items-end gap-2 h-48 px-4 border-b border-gray-700 pb-2">
                    {dailyData.map(([date, counts], i) => {
                        const totalHeight = ((counts.gemini + counts.perplexity + counts.email) / maxDailyUsage) * 100;
                        const dateObj = new Date(date);
                        const dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                        const dateLabel = dateObj.getDate();

                        return (
                            <div key={i} className="flex-1 flex flex-col items-center group relative">
                                {/* Tooltip */}
                                <div className="absolute -top-14 invisible group-hover:visible bg-white text-gray-900 p-2 rounded-lg text-[10px] font-bold shadow-2xl z-10 w-24">
                                    <p className="text-purple-600">Gemini: {counts.gemini}</p>
                                    <p className="text-cyan-600">Perplex: {counts.perplexity}</p>
                                    <p className="text-orange-600">Mails: {counts.email}</p>
                                </div>

                                <div className="w-full flex flex-col-reverse justify-start h-full">
                                    <div
                                        className="w-full bg-gradient-to-t from-orange-500 to-red-500 opacity-60 group-hover:opacity-100 transition-opacity"
                                        style={{ height: `${(counts.email / maxDailyUsage) * 100}%` }}
                                    />
                                    <div
                                        className="w-full bg-gradient-to-t from-cyan-500 to-blue-500 opacity-60 group-hover:opacity-100 transition-opacity"
                                        style={{ height: `${(counts.perplexity / maxDailyUsage) * 100}%` }}
                                    />
                                    <div
                                        className="w-full bg-gradient-to-t from-purple-500 to-pink-500 opacity-60 group-hover:opacity-100 transition-opacity"
                                        style={{ height: `${(counts.gemini / maxDailyUsage) * 100}%` }}
                                    />
                                </div>
                                <div className="mt-2 text-center">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">{dayLabel}</p>
                                    <p className="text-xs text-white font-black">{dateLabel}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-pink-500" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gemini API</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-cyan-500" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Perplexity API</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-orange-500" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Brevo Mails</span>
                    </div>
                </div>
            </div>

            {/* Recent Trace */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <h3 className="text-lg font-black mb-4 flex items-center gap-2 text-white">
                    <AlertTriangle className="text-red-400" size={20} />
                    Service Error Log
                </h3>
                <div className="space-y-2 overflow-y-auto max-h-[300px] pr-2 scrollbar-thin scrollbar-thumb-gray-700">
                    {recentErrors.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm font-bold">No errors detected in the last 7 days. Services healthy.</div>
                    ) : (
                        recentErrors.map((log, idx) => (
                            <div key={idx} className="bg-gray-900/50 p-3 rounded-xl border border-gray-700/50 flex items-center justify-between gap-4 transition-colors hover:border-gray-600">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${log.provider === 'Brevo' ? 'bg-orange-500/20 text-orange-400' : 'bg-red-500/20 text-red-400'
                                            }`}>
                                            {log.provider}
                                        </span>
                                        <span className="text-xs text-gray-300 font-bold truncate">
                                            {log.errorMessage || 'Unknown service failure'}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 font-medium">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <div className={`text-[10px] font-black px-2 py-1 rounded bg-gray-800 ${log.status === 'success' ? 'text-green-400' : 'text-red-400'
                                    } uppercase`}>
                                    {log.status.replace('_', ' ')}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
