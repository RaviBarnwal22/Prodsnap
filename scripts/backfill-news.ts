
import { prisma } from "../src/lib/prisma";
import { getApiKeys } from "../src/lib/ai/engine";
import dotenv from "dotenv";

dotenv.config();

async function backfillNews(dateStr: string, dayId: string) {
    const { gemini: geminiKeys, groq: groqKeys } = getApiKeys();

    if (geminiKeys.length === 0 && groqKeys.length === 0) {
        console.error("AI API keys not found.");
        return;
    }

    console.log(`Backfilling news for ${dateStr} (${dayId})...`);

    try {

        const prompt = `
# 🔒 Hallucination-Resistant Daily AI Briefing Prompt

## **System Role**
You are an AI research assistant generating a **fact-checked daily AI news briefing for Product Managers**.
Accuracy, source fidelity, and verifiability are **higher priority than creativity**.

---

## ⏱️ **Time Window**
* News published on ${dateStr}.
* Minimum: Always return at least 5-6 high-quality, distinct stories.

---

## 📰 **Source & Verification Rules**
Each story must come from a reputable source with a valid URL.

## 🎯 **PM-Relevance Filter**
Only include stories with clear, practical implications for Product Managers.

## 📦 **Response Format**
Return a JSON array of 5-6 objects strictly following this schema:
{
  "category": "string",
  "title": "string",
  "source": "string",
  "url": "string",
  "summary": "string",
  "pmPerspective": "string",
  "iconName": "string",
  "tags": ["string", "string", "string"]
}
    `;

        let text = "";

        // Try Gemini
        for (const key of geminiKeys) {
            try {
                const { GoogleGenerativeAI } = await import("@google/generative-ai");
                const genAI = new GoogleGenerativeAI(key);
                const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
                const result = await model.generateContent(prompt);
                text = result.response.text();
                if (text) break;
            } catch (e) {
                console.warn(`Gemini failed: ${e instanceof Error ? e.message : 'Unknown'}`);
            }
        }

        // Try Groq backup
        if (!text) {
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
                        const data: any = await res.json();
                        text = data.choices[0].message.content;
                        if (text) break;
                    }
                } catch (e) {
                    console.warn(`Groq failed`);
                }
            }
        }

        if (!text) throw new Error("All AI providers failed.");

        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error("No JSON array");
        const items = JSON.parse(jsonMatch[0]);

        for (const item of items) {
            const id = `art_backfill_${Math.random().toString(36).substr(2, 9)}`;
            // Set targetDate to the requested day at 5 AM UTC
            const targetDate = new Date(`${dayId}T05:00:00Z`);

            await (prisma as any).$executeRawUnsafe(`
                INSERT INTO "Article" ("id", "articleType", "category", "title", "source", "url", "date", "targetDate", "periodIdentifier", "iconName", "summary", "pmPerspective", "tags", "publishedAt", "createdAt", "updatedAt")
                VALUES ($1, 'DAILY', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::text[], NOW(), NOW(), NOW())
            `, id, item.category, item.title, item.source, item.url, dateStr, targetDate, dayId, item.iconName, item.summary, item.pmPerspective, item.tags);
        }
        console.log(`Successfully backfilled ${items.length} items for ${dateStr}`);
    } catch (e) {
        console.error("Failed:", e);
    }
}

async function main() {
    // Backfill Feb 12
    await backfillNews("Feb 12, 2026", "2026-02-12");
}

main().finally(() => prisma.$disconnect());
