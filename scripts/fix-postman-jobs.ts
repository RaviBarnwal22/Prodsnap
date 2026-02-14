
import { prisma } from "../src/lib/prisma";
import { getApiKeys } from "../src/lib/ai/engine";
import dotenv from "dotenv";

dotenv.config();

async function fixPostman() {
    const { gemini: geminiKeys, groq: groqKeys } = getApiKeys();
    if (geminiKeys.length === 0 && groqKeys.length === 0) {
        console.error("AI API keys not found.");
        return;
    }
    const query = "Latest deep linked Product Management roles at Postman (on job-boards.greenhouse.io/postman) Feb 2026";

    const prompt = `Search for: ${query}. 
Return exactly a JSON array of 5-8 UNIQUE, AUTHENTIC job objects: [{"title": "...", "company": "Postman", "location": "...", "source": "Greenhouse", "url": "...", "experience": "...", "category": "JOB", "jobType": "PM", "postedAt": "..."}].

CRITICAL URL REQUIREMENT:
1. URLs MUST be "Deep Links" specifically on the job-boards.greenhouse.io/postman domain.
2. Example: https://job-boards.greenhouse.io/postman/jobs/6665491003
3. Every job MUST exist and be active.`;

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
    const jobs = JSON.parse(jsonMatch[0]);

    try {
        for (const job of jobs) {
            console.log(`Saving Postman job: ${job.title} | ${job.url}`);
            await (prisma as any).job.upsert({
                where: { url: job.url },
                update: { isActive: true, updatedAt: new Date() },
                create: {
                    title: job.title,
                    company: "Postman",
                    location: job.location,
                    source: "Greenhouse",
                    url: job.url,
                    jobType: "JOB",
                    category: "PM",
                    postedAt: job.postedAt || "Feb 13, 2026",
                    isActive: true
                }
            });
        }
        console.log(`Successly added ${jobs.length} Postman jobs.`);
    } catch (e) {
        console.error("Failed:", e);
    }
}

fixPostman().finally(() => prisma.$disconnect());
