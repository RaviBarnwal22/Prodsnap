import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';

// API capacity limits (per day)
const API_LIMITS = {
    gemini: {
        free: 500, // Conservative estimate for free tier
        model: 'gemini-2.5-flash'
    },
    groq: {
        free: 14400, // ~10 requests per minute ballpark
        model: 'llama-3.3-70b'
    }
};

export async function GET(request: Request) {
    try {
        const user = await getUser();

        // Check if user is admin
        const isAdminEmail = user?.email === 'ravibarnwal89@gmail.com';
        if (!user || (!isAdminEmail && user.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const startDateStr = searchParams.get('startDate');
        const endDateStr = searchParams.get('endDate');

        // Default to today if no date provided
        const today = startDateStr ? new Date(startDateStr) : new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = endDateStr ? new Date(endDateStr) : new Date(today);
        if (!endDateStr) {
            tomorrow.setDate(tomorrow.getDate() + 1);
        } else {
            tomorrow.setHours(23, 59, 59, 999);
        }

        // Get last 7 days for trend (always show some trend regardless of selection)
        const last7Days = new Date(today);
        last7Days.setDate(last7Days.getDate() - 7);

        // Fetch today's usage from database
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

        // Fetch today's email usage - Use dynamic access for safety with stale generated clients
        const emailLogModel = (prisma as any).emailLog;
        let todayEmailUsage = 0;
        let weekEmailUsage: any[] = [];
        let recentEmailErrors: any[] = [];

        if (emailLogModel) {
            todayEmailUsage = await emailLogModel.count({
                where: {
                    createdAt: {
                        gte: today,
                        lt: tomorrow
                    }
                }
            });

            weekEmailUsage = await emailLogModel.findMany({
                where: {
                    createdAt: {
                        gte: last7Days
                    }
                },
                select: {
                    createdAt: true,
                    status: true
                }
            });

            recentEmailErrors = await emailLogModel.findMany({
                where: {
                    status: 'error',
                    createdAt: { gte: last7Days }
                },
                select: {
                    recipient: true,
                    status: true,
                    errorMessage: true,
                    createdAt: true
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 5
            });
        }

        // Calculate statistics
        const stats: any = {
            gemini: {
                total: 0,
                success: 0,
                error: 0,
                rate_limit: 0,
                capacity: API_LIMITS.gemini.free,
                model: API_LIMITS.gemini.model
            },
            groq: {
                total: 0,
                success: 0,
                error: 0,
                rate_limit: 0,
                capacity: API_LIMITS.groq.free,
                model: API_LIMITS.groq.model
            },
            email: {
                total: todayEmailUsage,
                capacity: 300, // Brevo Free Tier daily limit
                model: 'Brevo SMTP'
            }
        };

        todayUsage.forEach((item: any) => {
            const provider = item.provider as string;
            const count = item._count.id;
            const status = item.status;

            if (stats[provider]) {
                stats[provider].total += count;
                if (status === 'success' || status === 'error' || status === 'rate_limit') {
                    stats[provider][status] = count;
                }
            }
        });

        // Calculate daily breakdown for last 7 days
        const dailyBreakdown: Record<string, { gemini: number; groq: number; email: number }> = {};

        weekUsage.forEach((log: any) => {
            const dateKey = log.createdAt.toISOString().split('T')[0];
            if (!dailyBreakdown[dateKey]) {
                dailyBreakdown[dateKey] = { gemini: 0, groq: 0, email: 0 };
            }
            if (dailyBreakdown[dateKey][log.provider as keyof typeof dailyBreakdown[string]] !== undefined) {
                // @ts-ignore
                dailyBreakdown[dateKey][log.provider]++;
            }
        });

        // Add email breakdown
        weekEmailUsage.forEach((log: any) => {
            const dateKey = log.createdAt.toISOString().split('T')[0];
            if (!dailyBreakdown[dateKey]) {
                dailyBreakdown[dateKey] = { gemini: 0, groq: 0, email: 0 };
            }
            dailyBreakdown[dateKey].email++;
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
        avgResponseTimes.forEach((item: any) => {
            responseTimeMap[item.provider] = Math.round(item._avg.responseTime || 0);
        });

        // Get recent errors from API Usage
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
            recentErrors: [
                ...recentErrors,
                ...recentEmailErrors.map((e: any) => ({
                    provider: 'Brevo',
                    status: e.status,
                    errorMessage: e.errorMessage,
                    createdAt: e.createdAt
                }))
            ],
            limits: {
                ...API_LIMITS,
                email: { free: 300, model: 'Brevo SMTP' }
            }
        });

    } catch (error) {
        console.error('[API Usage Stats] CRITICAL ERROR:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch API usage statistics' },
            { status: 500 }
        );
    }
}
