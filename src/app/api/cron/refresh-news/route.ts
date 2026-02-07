import { refreshAINews } from "@/app/ai-news/actions";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    console.log("[Cron] Starting Daily AI Digest Refresh...");

    try {
        const result = await refreshAINews();

        if (result.success) {
            console.log(`[Cron] Successfully refreshed AI news. Count: ${result.count}`);
            return NextResponse.json({ success: true, count: result.count });
        } else {
            console.error(`[Cron] Failed to refresh AI news: ${result.error}`);
            return NextResponse.json({ success: false, error: result.error }, { status: 500 });
        }
    } catch (error) {
        console.error("[Cron] Unhandled error during refresh:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}
