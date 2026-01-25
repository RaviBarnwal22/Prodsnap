import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';

// API capacity limits (per day)
const API_LIMITS = {
    gemini: {
        free: 500, // Conservative estimate for free tier
        model: 'gemini-pro'
    },
    perplexity: {
        free: 720000, // 500 RPM * 60 * 24 (theoretical max for Tier 0)
        model: 'sonar'
    }
};

export async function GET() {
    try {
        const user = await getUser();

        // Check if user is admin
        const isAdminEmail = user?.email === 'ravibarnwal89@gmail.com';
        if (!user || (!isAdminEmail && user.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get last 7 days for trend
        const last7Days = new Date(today);
        last7Days.setDate(last7Days.getDate() - 7);

        // Fetch today's usage
        const todayUsage = await prisma.apiUsageLog.groupBy({
            by: ['provider', 'status'],
            where: {
                createdAt: {
                    gte: today,
                    lt: tomorrow
                }
            },
            _count: {
                id: true
            }
        });

        // Fetch last 7 days usage for trend
        const weekUsage = await prisma.apiUsageLog.findMany({
            where: {
                createdAt: {
                    gte: last7Days
                }
            },
            select: {
                provider: true,
                status: true,
                createdAt: true,
                responseTime: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        // Calculate statistics
        const stats = {
            gemini: {
                total: 0,
                success: 0,
                error: 0,
                rate_limit: 0,
                capacity: API_LIMITS.gemini.free,
                model: API_LIMITS.gemini.model
            },
            perplexity: {
                total: 0,
                success: 0,
                error: 0,
                rate_limit: 0,
                capacity: API_LIMITS.perplexity.free,
                model: API_LIMITS.perplexity.model
            }
        };

        todayUsage.forEach((item: { provider: string; status: string; _count: { id: number } }) => {
            const provider = item.provider as 'gemini' | 'perplexity';
            const count = item._count.id;
            const status = item.status;

            if (stats[provider]) {
                stats[provider].total += count;
                // Update specific status count
                if (status === 'success' || status === 'error' || status === 'rate_limit') {
                    stats[provider][status] = count;
                }
            }
        });

        // Calculate daily breakdown for last 7 days
        const dailyBreakdown: Record<string, { gemini: number; perplexity: number }> = {};

        weekUsage.forEach((log: { provider: string; createdAt: Date }) => {
            const dateKey = log.createdAt.toISOString().split('T')[0];
            if (!dailyBreakdown[dateKey]) {
                dailyBreakdown[dateKey] = { gemini: 0, perplexity: 0 };
            }
            dailyBreakdown[dateKey][log.provider as 'gemini' | 'perplexity']++;
        });

        // Calculate average response times
        const avgResponseTimes = await prisma.apiUsageLog.groupBy({
            by: ['provider'],
            where: {
                createdAt: { gte: today },
                status: 'success',
                responseTime: { not: null }
            },
            _avg: {
                responseTime: true
            }
        });

        const responseTimeMap: Record<string, number> = {};
        avgResponseTimes.forEach((item: { provider: string; _avg: { responseTime: number | null } }) => {
            responseTimeMap[item.provider] = Math.round(item._avg.responseTime || 0);
        });

        // Get recent errors
        const recentErrors = await prisma.apiUsageLog.findMany({
            where: {
                status: { in: ['error', 'rate_limit'] },
                createdAt: { gte: last7Days }
            },
            select: {
                provider: true,
                status: true,
                errorMessage: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 10
        });

        return NextResponse.json({
            stats,
            dailyBreakdown,
            responseTimeMap,
            recentErrors,
            limits: API_LIMITS
        });

    } catch (error) {
        console.error('[API Usage Stats] Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch API usage statistics' },
            { status: 500 }
        );
    }
}
