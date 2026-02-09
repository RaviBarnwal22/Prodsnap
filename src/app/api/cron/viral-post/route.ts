import { generateViralLinkedInPost } from "@/app/actions";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';
    const cronSecret = process.env.CRON_SECRET;

    // Security check
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return new Response('Unauthorized', { status: 401 });
    } else if (!cronSecret && !isVercelCron) {
        return new Response('Unauthorized', { status: 401 });
    }

    console.log("[Cron] Triggering Daily Viral LinkedIn Post Generation (9 AM IST)...");

    try {
        const result = await generateViralLinkedInPost();

        if (result.success) {
            console.log(`[Cron] Viral Post Success: ${result.post?.topic}`);
            return NextResponse.json({ success: true, topic: result.post?.topic });
        } else {
            console.error(`[Cron] Viral Post Failed: ${result.error}`);
            return NextResponse.json({ success: false, error: result.error }, { status: 500 });
        }
    } catch (error) {
        console.error("[Cron] Viral Post Internal Error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Internal Error"
        }, { status: 500 });
    }
}
