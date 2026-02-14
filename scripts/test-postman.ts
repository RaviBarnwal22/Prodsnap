
import { getApiKeys } from "../src/lib/ai/engine";
import dotenv from "dotenv";

dotenv.config({ path: ".env.production" });

async function testPostman() {
    const apiKeys = getApiKeys()
    const perplexityKey = apiKeys.find(key => key.startsWith('pplx-'))
    const query = "Product management roles at Postman (Greenhouse deep links 2026), BrowserStack, and Hasura India";

    const prompt = `Search for: ${query}. 
Return exactly a JSON array of 8-10 UNIQUE, AUTHENTIC job objects: [{"title": "...", "company": "...", "location": "...", "source": "...", "url": "...", "experience": "...", "category": "JOB/INTERNSHIP", "jobType": "PM/APM/Senior PM/Lead/Director", "postedAt": "..."}].

CRITICAL URL REQUIREMENT:
1. URLs MUST be "Deep Links" to specific role pages on ATS like Greenhouse, Lever, Workday (e.g. https://boards.greenhouse.io/company/jobs/123456).
2. DISCARD generic career portal homepages (e.g., NO careers.google.com).
3. Every job MUST exist and be active.`;

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
    console.log(data.choices[0].message.content);
}

testPostman();
