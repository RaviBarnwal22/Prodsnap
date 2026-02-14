
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const categories = [
    "CONSUMER_PRODUCT_DESIGN",
    "METRICS",
    "GROWTH_RETENTION",
    "TECH_ACUMEN",
    "GTM",
    "BEHAVIORAL",
    "RCA",
    "GUESTIMATES",
    "STRATEGY"
];

async function generateCasesForCategory(category: string, count: number) {
    console.log(`Generating ${count} cases for category: ${category}...`);

    const prompt = `Generate exactly ${count} unique and high-quality Product Management practice interview questions for the category "${category}".
Return a JSON array of objects with the following schema:
[
  {
    "title": "Clear question title",
    "description": "Detailed question description/scenario",
    "category": "${category}",
    "difficulty": "Easy/Medium/Hard",
    "solutionText": "A structured guide on how to answer this question (e.g. using frameworks like CIRCLES, STAR, etc.)",
    "sampleAnswer": "A sample high-quality response"
  }
]
Focus on top tech companies like Google, Meta, Amazon, Uber, and Indian unicorns like Zomato, CRED, Swiggy, Flipkart. Ensure the scenarios are realistic and diverse.`;

    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    if (!geminiKey && !groqKey) {
        throw new Error("No AI API keys found in .env");
    }

    let text = "";

    // Try Gemini first
    if (geminiKey) {
        try {
            const { GoogleGenerativeAI } = await import("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(geminiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const result = await model.generateContent(prompt);
            text = result.response.text();
        } catch (e) {
            console.warn(`[Add More Cases] Gemini failed: ${e instanceof Error ? e.message : 'Unknown'}`);
        }
    }

    // Try Groq as fallback
    if (!text && groqKey) {
        try {
            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${groqKey}` },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: "You are an expert PM interviewer. Respond strictly in valid JSON." },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.2
                })
            });
            if (res.ok) {
                const data: any = await res.json();
                text = data.choices[0].message.content;
            }
        } catch (e) {
            console.warn(`[Add More Cases] Groq failed`);
        }
    }

    if (!text) throw new Error("All AI providers failed to generate content.");

    // Extract JSON
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    if (firstBracket === -1 || lastBracket === -1) {
        throw new Error("Could not find JSON array in response");
    }
    const cleanJson = text.substring(firstBracket, lastBracket + 1);
    return JSON.parse(cleanJson);
}

async function main() {
    let totalAdded = 0;

    for (const cat of categories) {
        try {
            // Generate 10 cases per category
            const newCases = await generateCasesForCategory(cat, 10);

            for (const c of newCases) {
                await prisma.practiceQuestion.create({
                    data: {
                        title: c.title,
                        description: c.description,
                        category: c.category,
                        difficulty: c.difficulty || "Medium",
                        solutionText: c.solutionText,
                        sampleAnswer: c.sampleAnswer,
                        isFree: Math.random() > 0.8 // 20% free
                    }
                });
                totalAdded++;
            }
            console.log(`Added ${newCases.length} cases for ${cat}`);
            // Sleep to avoid rate limits
            await new Promise(r => setTimeout(r, 2000));
        } catch (error) {
            console.error(`Failed to generate for ${cat}:`, error);
        }
    }

    console.log(`Successfully added ${totalAdded} new cases in total.`);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
