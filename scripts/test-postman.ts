
import { getApiKeys } from "../src/lib/ai/engine";
import dotenv from "dotenv";

dotenv.config();

async function testPostman() {
    const { gemini: geminiKeys, groq: groqKeys } = getApiKeys();
    if (geminiKeys.length === 0 && groqKeys.length === 0) {
        console.error("AI API keys not found.");
        return;
    }
    const query = "Product management roles at Postman (Greenhouse deep links 2026), BrowserStack, and Hasura India";

    const prompt = `Search for: ${query}. 
Return exactly a JSON array of 8-10 UNIQUE, AUTHENTIC job objects: [{"title": "...", "company": "...", "location": "...", "source": "...", "url": "...", "experience": "...", "category": "JOB/INTERNSHIP", "jobType": "PM/APM/Senior PM/Lead/Director", "postedAt": "..."}].

CRITICAL URL REQUIREMENT:
1. URLs MUST be "Deep Links" to specific role pages on ATS like Greenhouse, Lever, Workday (e.g. https://boards.greenhouse.io/company/jobs/123456).
2. DISCARD generic career portal homepages (e.g., NO careers.google.com).
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

    console.log(text || "All AI providers failed.");
}

testPostman();
