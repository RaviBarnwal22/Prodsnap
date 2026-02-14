'use server'

import { prisma } from "@/lib/prisma"
import { getApiKeys } from "@/lib/ai/engine"
import { GoogleGenerativeAI } from "@google/generative-ai"

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
    const { gemini: geminiKeys, groq: groqKeys } = getApiKeys();

    // 1. Get all daily articles for this period
    let articles: any[] = [];
    if (type === 'WEEKLY_TOP') {
        articles = await (prisma as any).$queryRawUnsafe(`
            SELECT * FROM "Article" 
            WHERE "articleType" = 'DAILY' 
            AND "periodIdentifier" LIKE $1
        `, `${periodId.split('-')[0]}%`);
    } else {
        articles = await (prisma as any).$queryRawUnsafe(`
            SELECT * FROM "Article" 
            WHERE "articleType" = 'DAILY' 
            AND "periodIdentifier" = $1
        `, periodId);
    }

    if (articles.length === 0) return;

    const existing = await (prisma as any).$queryRawUnsafe(`
        SELECT id FROM "Article" WHERE "articleType" = $1 AND "periodIdentifier" = $2 LIMIT 1
    `, type, periodId);

    if (existing.length > 0) return;

    // 2. Use AI to pick the TOP ones
    const prompt = `From the following AI news articles collected over a ${type === 'WEEKLY_TOP' ? 'week' : 'month'}, 
pick the TOP ${limit} most significant ones for Product Managers. Return ONLY the IDs as a JSON array.
Articles:
${articles.map(a => `ID: ${a.id} | Title: ${a.title}`).join('\n')}`;

    let topIds: string[] = [];

    // Try Gemini
    for (const key of geminiKeys) {
        try {
            const genAI = new GoogleGenerativeAI(key);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const match = text.match(/\[[\s\S]*\]/);
            if (match) { topIds = JSON.parse(match[0]); break; }
        } catch (e) { }
    }

    // Try Groq fallback if gemini failed
    if (topIds.length === 0) {
        for (const key of groqKeys) {
            try {
                const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
                    body: JSON.stringify({
                        model: "llama-3.3-70b-versatile",
                        messages: [{ role: "user", content: prompt }],
                        temperature: 0.1
                    })
                });
                if (res.ok) {
                    const data = await res.json();
                    const text = data.choices[0].message.content;
                    const match = text.match(/\[[\s\S]*\]/);
                    if (match) { topIds = JSON.parse(match[0]); break; }
                }
            } catch (e) { }
        }
    }

    if (topIds.length > 0) {
        const topArticles = articles.filter(a => topIds.includes(a.id));
        for (const art of topArticles) {
            const newId = `snap_${Math.random().toString(36).substr(2, 9)}`;
            await (prisma as any).$executeRawUnsafe(`
                INSERT INTO "Article" ("id", "articleType", "category", "title", "source", "url", "date", "targetDate", "periodIdentifier", "iconName", "summary", "pmPerspective", "tags", "publishedAt", "createdAt", "updatedAt")
                SELECT $1, $2, "category", "title", "source", "url", "date", "targetDate", $3, "iconName", "summary", "pmPerspective", "tags", NOW(), NOW(), NOW()
                FROM "Article" WHERE "id" = $4
            `, newId, type, periodId, art.id);
        }
    } else {
        // Final fallback: Pick top ones by date
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
}

async function archiveOldNews() {
    const now = new Date();
    const istDate = new Date(now.getTime() + (6 * 60 * 60 * 1000));
    const sevenDaysAgo = new Date(istDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    const currentWeekId = getWeekIdentifier(istDate);
    const dayBefore = new Date(istDate.getTime() - 24 * 60 * 60 * 1000);
    const prevWeekId = getWeekIdentifier(dayBefore);

    if (currentWeekId !== prevWeekId) {
        await createSnapshot('WEEKLY_TOP', prevWeekId, 10);
    }

    const currentMonthId = getMonthIdentifier(istDate);
    const prevMonthId = getMonthIdentifier(dayBefore);
    if (currentMonthId !== prevMonthId) {
        await createSnapshot('MONTHLY_TOP', prevMonthId, 25);
    }

    await (prisma as any).$executeRawUnsafe(`
        DELETE FROM "Article" 
        WHERE "articleType" = 'DAILY' 
        AND "targetDate" < $1
    `, sevenDaysAgo);
}

export async function refreshAINews() {
    const { gemini: geminiKeys, groq: groqKeys } = getApiKeys();

    if (geminiKeys.length === 0 && groqKeys.length === 0) {
        return { success: false, error: "AI API keys (Gemini/Groq) not found." }
    }

    await archiveOldNews();

    const now = new Date();
    const istDate = new Date(now.getTime() + (6 * 60 * 60 * 1000));
    const todayStr = istDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const dayIdentifier = istDate.toISOString().split('T')[0];

    const prompt = `# Daily AI Briefing for Product Managers. Date: ${todayStr}.
Return exactly a JSON array of 4-6 objects: [{"category": "...", "title": "...", "source": "...", "url": "...", "summary": "...", "pmPerspective": "...", "iconName": "...", "tags": [...]}]
Focus on verifiable AI launches, enterprise news, and PM-relevant shifts from the last 24-48 hours. Output ONLY valid JSON.`;

    let newsItems: any[] = [];

    // Try Gemini
    for (const key of geminiKeys) {
        try {
            const genAI = new GoogleGenerativeAI(key);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) { newsItems = JSON.parse(jsonMatch[0]); break; }
        } catch (e) {
            console.warn(`[AI News] Gemini failed: ${e instanceof Error ? e.message : 'Unknown'}`);
        }
    }

    // Try Groq backup
    if (newsItems.length === 0) {
        for (const key of groqKeys) {
            try {
                const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
                    body: JSON.stringify({
                        model: "llama-3.3-70b-versatile",
                        messages: [{ role: "user", content: prompt }],
                        temperature: 0.2
                    })
                });
                if (res.ok) {
                    const data = await res.json();
                    const text = data.choices[0].message.content;
                    const jsonMatch = text.match(/\[[\s\S]*\]/);
                    if (jsonMatch) { newsItems = JSON.parse(jsonMatch[0]); break; }
                }
            } catch (e) {
                console.warn(`[AI News] Groq failed`);
            }
        }
    }

    if (newsItems.length === 0) {
        return { success: false, error: "Could not fetch AI news from any provider." };
    }

    for (const item of newsItems) {
        const id = `art_${Math.random().toString(36).substr(2, 9)}`;
        await (prisma as any).$executeRawUnsafe(`
            INSERT INTO "Article" ("id", "articleType", "category", "title", "source", "url", "date", "targetDate", "periodIdentifier", "iconName", "summary", "pmPerspective", "tags", "publishedAt", "createdAt", "updatedAt")
            VALUES ($1, 'DAILY', $2, $3, $4, $5, $6, NOW(), $7, $8, $9, $10, $11::text[], NOW(), NOW(), NOW())
        `, id, item.category, item.title, item.source, item.url, todayStr, dayIdentifier, item.iconName, item.summary, item.pmPerspective, item.tags);
    }

    try {
        const { revalidatePath } = await import('next/cache');
        revalidatePath('/ai-news');
    } catch (e) { }

    return { success: true, count: newsItems.length };
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
            SELECT "periodIdentifier", MAX("date") as "date"
            FROM "Article" 
            WHERE "articleType" = $1 AND "periodIdentifier" IS NOT NULL
            GROUP BY "periodIdentifier"
            ORDER BY "periodIdentifier" DESC
        `, type);
        return periods;
    } catch (error) {
        console.error("[AI News Action] Fetch Periods Error:", error);
        return [];
    }
}
