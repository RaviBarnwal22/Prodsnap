import { refreshAINews } from "@/app/ai-news/actions";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // Only the CRON_SECRET bearer token authorizes. The x-vercel-cron header
    // used to be accepted too, but any caller can send it. Vercel Cron sends
    // "Authorization: Bearer <CRON_SECRET>" itself once that env var is set.
    // With no secret configured this fails closed rather than open.
    const cronSecret = process.env.CRON_SECRET;
    const isAuthorized = !!cronSecret && request.headers.get('authorization') === `Bearer ${cronSecret}`;

    if (!isAuthorized) {
        console.error("[Cron] Unauthorized attempt - missing or wrong CRON_SECRET");
        return new Response('Unauthorized', { status: 401 });
    }

    console.log("[Cron] Triggering Daily AI Digest Refresh (IST Schedule)...");

    try {
        const result = await refreshAINews();

        if (result.success) {
            console.log(`[Cron] Success! New articles added: ${result.count}`);
            return NextResponse.json({ success: true, count: result.count });
        } else {
            console.error(`[Cron] Process failed: ${result.error}`);
            return NextResponse.json({ success: false, error: result.error }, { status: 500 });
        }
    } catch (error) {
        console.error("[Cron] Internal exception:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Internal Cron Error"
        }, { status: 500 });
    }
}
