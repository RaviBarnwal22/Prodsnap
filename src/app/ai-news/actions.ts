'use server'

import { prisma } from "@/lib/prisma"
import { getApiKeys } from "@/lib/ai/engine"

function getWeekIdentifier(date: Date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}

function getMonthIdentifier(date: Date) {
    return `${date.getFullYear()}-M${(date.getMonth() + 1).toString().padStart(2, '0')}`;
}

async function createSnapshot(type: 'WEEKLY_TOP' | 'MONTHLY_TOP', periodId: string, limit: number) {
    const apiKeys = getApiKeys()
    const perplexityKey = apiKeys.find(key => key.startsWith('pplx-'))

    // 1. Get all daily articles for this period
    let articles: any[] = [];
    if (type === 'WEEKLY_TOP') {
        articles = await (prisma as any).$queryRawUnsafe(`
            SELECT * FROM "Article" 
            WHERE "articleType" = 'DAILY' 
            AND "periodIdentifier" LIKE $1
        `, `${periodId.split('-')[0]}%`); // Simple check, we can refine this
        // Actually simpler: just find articles where the generated weekId matches
        // To be precise, let's just fetch everything from the last 14 days and filter in JS
    } else {
        articles = await (prisma as any).$queryRawUnsafe(`
            SELECT * FROM "Article" 
            WHERE "articleType" = 'DAILY' 
            AND "periodIdentifier" = $1
        `, periodId);
    }

    if (articles.length === 0) return;

    // Check if snapshot already exists
    const existing = await (prisma as any).$queryRawUnsafe(`
        SELECT id FROM "Article" WHERE "articleType" = $1 AND "periodIdentifier" = $2 LIMIT 1
    `, type, periodId);

    if (existing.length > 0) return;

    // 2. Use AI to pick the TOP ones
    if (perplexityKey) {
        const articleList = articles.map(a => `- [${a.category}] ${a.title} (Source: ${a.source})`).join('\n');
        const prompt = `
            From the following AI news articles collected over a ${type === 'WEEKLY_TOP' ? 'week' : 'month'}, 
            pick the TOP ${limit} most significant ones for Product Managers.
            Return ONLY the IDs of these articles as a JSON array.
            
            Articles:
            ${articles.map(a => `ID: ${a.id} | Title: ${a.title}`).join('\n')}
        `;

        try {
            const res = await fetch("https://api.perplexity.ai/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${perplexityKey}`
                },
                body: JSON.stringify({
                    model: "sonar",
                    messages: [
                        { role: "system", content: "You are a senior PM mentor. Return ONLY a JSON array of IDs." },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.1
                })
            });

            if (res.ok) {
                const data = await res.json();
                const text = data.choices[0].message.content;
                const idsMatch = text.match(/\[[\s\S]*\]/);
                if (idsMatch) {
                    const topIds = JSON.parse(idsMatch[0]);
                    const topArticles = articles.filter(a => topIds.includes(a.id));

                    for (const art of topArticles) {
                        const newId = `snap_${Math.random().toString(36).substr(2, 9)}`;
                        await (prisma as any).$executeRawUnsafe(`
                            INSERT INTO "Article" ("id", "articleType", "category", "title", "source", "url", "date", "targetDate", "periodIdentifier", "iconName", "summary", "pmPerspective", "tags", "publishedAt", "createdAt", "updatedAt")
                            SELECT $1, $2, "category", "title", "source", "url", "date", "targetDate", $3, "iconName", "summary", "pmPerspective", "tags", NOW(), NOW(), NOW()
                            FROM "Article" WHERE "id" = $4
                        `, newId, type, periodId, art.id);
                    }
                    return;
                }
            }
        } catch (e) {
            console.error("[Snapshot] AI failed, falling back to recent ones", e);
        }
    }

    // Fallback: Pick top ones by date
    const sorted = articles.sort((a, b) => new Date(b.targetDate).getTime() - new Date(a.targetDate).getTime()).slice(0, limit);
    for (const art of sorted) {
        const newId = `snap_fallback_${Math.random().toString(36).substr(2, 9)}`;
        await (prisma as any).$executeRawUnsafe(`
            INSERT INTO "Article" ("id", "articleType", "category", "title", "source", "url", "date", "targetDate", "periodIdentifier", "iconName", "summary", "pmPerspective", "tags", "publishedAt", "createdAt", "updatedAt")
            SELECT $1, $2, "category", "title", "source", "url", "date", "targetDate", $3, "iconName", "summary", "pmPerspective", "tags", NOW(), NOW(), NOW()
            FROM "Article" WHERE "id" = $4
        `, newId, type, periodId, art.id);
    }
}

async function archiveOldNews() {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 1. Identify if we need to snapshot a week/month
    // We snapshot the "previous" week if today is a new week start or just periodically
    const currentWeekId = getWeekIdentifier(now);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const prevWeekId = getWeekIdentifier(yesterday);

    if (currentWeekId !== prevWeekId) {
        await createSnapshot('WEEKLY_TOP', prevWeekId, 10);
    }

    const currentMonthId = getMonthIdentifier(now);
    const prevMonthId = getMonthIdentifier(yesterday);
    if (currentMonthId !== prevMonthId) {
        await createSnapshot('MONTHLY_TOP', prevMonthId, 25);
    }

    // 2. Delete DAILY articles older than 7 days
    await (prisma as any).$executeRawUnsafe(`
        DELETE FROM "Article" 
        WHERE "articleType" = 'DAILY' 
        AND "targetDate" < $1
    `, sevenDaysAgo);
}

export async function refreshAINews() {
    const apiKeys = getApiKeys()
    const perplexityKey = apiKeys.find(key => key.startsWith('pplx-'))

    if (!perplexityKey) {
        return { success: false, error: "Perplexity API key not found. Real-time news requires Perplexity." }
    }

    // Run archival logic
    await archiveOldNews();

    const today = new Date();
    const todayStr = today.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    const dayIdentifier = today.toISOString().split('T')[0];

    const prompt = `
        Search for the top 6 most significant AI news stories today (${todayStr}) or from the last 24 hours.
        Focus on news that matters specifically to Product Managers (breakthroughs, M&A, regulation, new consumer features, industrial AI).
        
        For each story, provide:
        1. category: A short category (e.g., Initiatives, Consumer Tech, Agentic AI, Robotics, Regulation, etc.)
        2. title: A catchy but professional headline.
        3. source: The news source name.
        4. url: A valid URL to the news story.
        5. summary: A 2-sentence summary of the news.
        6. pmPerspective: A "PM's Perspective" explaining why this matters for Product Managers (1-2 sentences).
        7. iconName: Choose the most appropriate Lucide React icon name from this list: [Rocket, Shield, Brain, Cpu, Globe, TrendingUp, Newspaper, Zap, MessageSquare, Bot, Box].
        8. tags: 3 relevant tags as an array of strings.

        Respond ONLY with a valid JSON array of objects following this structure:
        [
            {
                "category": "...",
                "title": "...",
                "source": "...",
                "url": "...",
                "summary": "...",
                "pmPerspective": "...",
                "iconName": "...",
                "tags": ["...", "...", "..."]
            }
        ]
    `;

    try {
        const res = await fetch("https://api.perplexity.ai/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${perplexityKey}`
            },
            body: JSON.stringify({
                model: "sonar",
                messages: [
                    { role: "system", content: "You are a professional tech journalist and PM mentor. Return ONLY valid JSON." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.2
            })
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Perplexity API Error: ${res.status} - ${errorText}`);
        }

        const data = await res.json();
        const text = data.choices[0].message.content;
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error("Could not find JSON array in response");
        const newsItems = JSON.parse(jsonMatch[0]);

        for (const item of newsItems) {
            const id = `art_${Math.random().toString(36).substr(2, 9)}`;
            await (prisma as any).$executeRawUnsafe(`
                INSERT INTO "Article" ("id", "articleType", "category", "title", "source", "url", "date", "targetDate", "periodIdentifier", "iconName", "summary", "pmPerspective", "tags", "publishedAt", "createdAt", "updatedAt")
                VALUES ($1, 'DAILY', $2, $3, $4, $5, $6, NOW(), $7, $8, $9, $10, $11::text[], NOW(), NOW(), NOW())
            `, id, item.category, item.title, item.source, item.url, todayStr, dayIdentifier, item.iconName, item.summary, item.pmPerspective, item.tags);
        }

        const { revalidatePath } = await import('next/cache');
        revalidatePath('/ai-news');

        return { success: true, count: newsItems.length };
    } catch (error) {
        console.error("[AI News Action] Error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to refresh news" };
    }
}

export async function getAINews(type: 'DAILY' | 'WEEKLY_TOP' | 'MONTHLY_TOP' = 'DAILY', periodId?: string) {
    try {
        let news: any[] = [];
        if (type === 'DAILY') {
            if (periodId) {
                news = await (prisma as any).$queryRawUnsafe(`
                    SELECT * FROM "Article" WHERE "articleType" = 'DAILY' AND "periodIdentifier" = $1 ORDER BY "targetDate" DESC
                `, periodId);
            } else {
                news = await (prisma as any).$queryRawUnsafe(`
                    SELECT * FROM "Article" WHERE "articleType" = 'DAILY' ORDER BY "targetDate" DESC LIMIT 6
                `);
            }
        } else {
            if (periodId) {
                news = await (prisma as any).$queryRawUnsafe(`
                    SELECT * FROM "Article" WHERE "articleType" = $1 AND "periodIdentifier" = $2 ORDER BY "targetDate" DESC
                `, type, periodId);
            } else {
                // Get latest snapshot period
                const latestPeriod = await (prisma as any).$queryRawUnsafe(`
                    SELECT "periodIdentifier" FROM "Article" WHERE "articleType" = $1 ORDER BY "targetDate" DESC LIMIT 1
                `, type);

                if (latestPeriod.length > 0) {
                    news = await (prisma as any).$queryRawUnsafe(`
                        SELECT * FROM "Article" WHERE "articleType" = $1 AND "periodIdentifier" = $2 ORDER BY "targetDate" DESC
                    `, type, latestPeriod[0].periodIdentifier);
                } else {
                    // Fallback: If no weekly/monthly snapshots exist, show daily articles from the last 7/30 days
                    const limit = type === 'WEEKLY_TOP' ? 10 : 25;
                    news = await (prisma as any).$queryRawUnsafe(`
                        SELECT * FROM "Article" 
                        WHERE "articleType" = 'DAILY' 
                        ORDER BY "targetDate" DESC 
                        LIMIT $1
                    `, limit);
                }
            }
        }
        return JSON.parse(JSON.stringify(news));
    } catch (error) {
        console.error("[AI News Action] Fetch Error:", error);
        return [];
    }
}

export async function getAvailablePeriods(type: 'DAILY' | 'WEEKLY_TOP' | 'MONTHLY_TOP') {
    try {
        const periods = await (prisma as any).$queryRawUnsafe(`
            SELECT DISTINCT "periodIdentifier", "date" 
            FROM "Article" 
            WHERE "articleType" = $1 
            ORDER BY "periodIdentifier" DESC
        `, type);
        return periods;
    } catch (error) {
        console.error("[AI News Action] Fetch Periods Error:", error);
        return [];
    }
}
