import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const user = await getUser();

        // Check if user is admin
        const isAdminEmail = user?.email === 'ravibarnwal89@gmail.com';
        if (!user || (!isAdminEmail && user.role !== 'ADMIN')) {
            return new Response('Unauthorized', { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const startDateStr = searchParams.get('startDate');
        const endDateStr = searchParams.get('endDate');

        let whereClause: any = {};
        if (startDateStr || endDateStr) {
            whereClause.createdAt = {};
            if (startDateStr) whereClause.createdAt.gte = new Date(startDateStr);
            if (endDateStr) {
                const end = new Date(endDateStr);
                end.setHours(23, 59, 59, 999);
                whereClause.createdAt.lte = end;
            }
        }

        // Fetch all API usage logs
        const apiLogs = await prisma.apiUsageLog.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' }
        });

        // Fetch all Email logs
        const emailLogModel = (prisma as any).emailLog;
        let emailLogs: any[] = [];
        if (emailLogModel) {
            emailLogs = await emailLogModel.findMany({
                where: whereClause,
                orderBy: { createdAt: 'desc' }
            });
        }

        // Group by Date and Provider
        const dailySummary: Record<string, { gemini: number; groq: number; email: number }> = {};

        apiLogs.forEach(log => {
            const date = log.createdAt.toISOString().split('T')[0];
            if (!dailySummary[date]) {
                dailySummary[date] = { gemini: 0, groq: 0, email: 0 };
            }
            if (log.provider === 'gemini') dailySummary[date].gemini++;
            if (log.provider === 'perplexity' || log.provider === 'groq') dailySummary[date].groq++;
        });

        emailLogs.forEach(log => {
            const date = log.createdAt.toISOString().split('T')[0];
            if (!dailySummary[date]) {
                dailySummary[date] = { gemini: 0, groq: 0, email: 0 };
            }
            dailySummary[date].email++;
        });

        // Create CSV Content
        let csv = 'Date,Gemini Usage,Groq Usage,Brevo Email Usage,Total\n';

        const sortedDates = Object.keys(dailySummary).sort((a, b) => b.localeCompare(a));

        sortedDates.forEach(date => {
            const day = dailySummary[date];
            const total = day.gemini + day.groq + day.email;
            csv += `${date},${day.gemini},${day.groq},${day.email},${total}\n`;
        });

        // Return as CSV file
        return new Response(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="prodsnap_usage_report_${new Date().toISOString().split('T')[0]}.csv"`
            }
        });

    } catch (error) {
        console.error('[Export Usage] Error:', error);
        return new Response('Failed to export data', { status: 500 });
    }
}
