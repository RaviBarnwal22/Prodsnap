import { generateViralLinkedInPost } from "@/lib/viral-post";
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
