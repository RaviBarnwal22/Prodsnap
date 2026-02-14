import { refreshJobs } from "@/app/jobs/actions";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';
    const cronSecret = process.env.CRON_SECRET;

    // Allow if it is Vercel Cron OR if the secret matches
    const isAuthorized = isVercelCron || (cronSecret && authHeader === `Bearer ${cronSecret}`);

    if (!isAuthorized) {
        console.error("[Cron Jobs] Unauthorized attempt");
        return new Response('Unauthorized', { status: 401 });
    }

    console.log("[Cron Jobs] Triggering Job Refresh...");

    try {
        const result = await refreshJobs();

        if (result.success) {
            console.log(`[Cron Jobs] Success! Jobs updated: ${result.count}`);
            return NextResponse.json({ success: true, count: result.count });
        } else {
            console.error(`[Cron Jobs] Process failed: ${result.error}`);
            return NextResponse.json({ success: false, error: result.error }, { status: 500 });
        }
    } catch (error) {
        console.error("[Cron Jobs] Internal exception:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Internal Cron Error"
        }, { status: 500 });
    }
}
