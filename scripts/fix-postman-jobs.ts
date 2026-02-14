
import { prisma } from "../src/lib/prisma";
import { getApiKeys } from "../src/lib/ai/engine";
import dotenv from "dotenv";

dotenv.config({ path: ".env.production" });

async function fixPostman() {
    const apiKeys = getApiKeys()
    const perplexityKey = apiKeys.find(key => key.startsWith('pplx-'))
    const query = "Latest deep linked Product Management roles at Postman (on job-boards.greenhouse.io/postman) Feb 2026";

    const prompt = `Search for: ${query}. 
Return exactly a JSON array of 5-8 UNIQUE, AUTHENTIC job objects: [{"title": "...", "company": "Postman", "location": "...", "source": "Greenhouse", "url": "...", "experience": "...", "category": "JOB", "jobType": "PM", "postedAt": "..."}].

CRITICAL URL REQUIREMENT:
1. URLs MUST be "Deep Links" specifically on the job-boards.greenhouse.io/postman domain.
2. Example: https://job-boards.greenhouse.io/postman/jobs/6665491003
3. Every job MUST exist and be active.`;

    try {
        const res = await fetch("https://api.perplexity.ai/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${perplexityKey}`
            },
            body: JSON.stringify({
                model: "sonar",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.1
            })
        });

        const data: any = await res.json();
        const text = data.choices[0].message.content;
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error("No JSON found");
        const jobs = JSON.parse(jsonMatch[0]);

        for (const job of jobs) {
            console.log(`Saving Postman job: ${job.title} | ${job.url}`);
            await prisma.job.upsert({
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
