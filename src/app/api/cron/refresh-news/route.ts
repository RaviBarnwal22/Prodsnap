import { NextResponse } from 'next/server'
import { refreshAINews } from '@/app/ai-news/actions'

// This can be triggered by a CRON job or manually to refresh the news
export async function GET(request: Request) {
    // Optional: Add a simple secret key check for security
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    // Check if it matches an environment variable or just a simple placeholder for now
    if (process.env.CRON_SECRET && key !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const result = await refreshAINews()
        return NextResponse.json(result)
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to trigger refresh' }, { status: 500 })
    }
}
