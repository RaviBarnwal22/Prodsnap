import { prisma } from "@/lib/prisma"

// Not a server action on purpose. Everything exported from app/actions.ts is
// a public HTTP endpoint, because client components import that file, so a
// generator that spends AI quota and overwrites the day's post cannot live
// there unguarded. Callers authorize first: the admin-gated action
// generateViralLinkedInPostManual, and the cron route behind CRON_SECRET.
export async function generateViralLinkedInPost() {
    try {
        const { getApiKeys } = await import("@/lib/ai/engine");
        const { gemini: geminiKeys, groq: groqKeys } = getApiKeys();

        if (geminiKeys.length === 0 && groqKeys.length === 0) {
            return { success: false, error: "AI API keys missing" };
        }

        const now = new Date();
        const istDate = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
        const dayIdentifier = istDate.toISOString().split('T')[0];
        const displayDate = istDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const prompt = `Research a top AI breakthrough from the last 72 hours. Write a viral 150-word LinkedIn post with:
1. Punchy Hook. 2. Summary. 3. Official Source Link. 4. PM Importance. 5. Engagement Question.
Tone: Storyteller. Line breaks for readability. Output ONLY the post content.`;

        let content = "";

        for (const key of geminiKeys) {
            try {
                const { GoogleGenerativeAI } = await import("@google/generative-ai");
                const genAI = new GoogleGenerativeAI(key);
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
                const result = await model.generateContent(prompt);
                content = result.response.text();
                if (content) break;
            } catch (e) { }
        }

        if (!content) {
            for (const key of groqKeys) {
                try {
                    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
                        body: JSON.stringify({
                            model: "llama-3.3-70b-versatile",
                            messages: [{ role: "user", content: prompt }]
                        })
                    });
                    if (res.ok) {
                        const data = await res.json();
                        content = data.choices[0].message.content;
                        if (content) break;
                    }
                } catch (e) { }
            }
        }

        if (!content) throw new Error("AI generation failed");

        content = content.replace(/^```[a-z]*\n/i, '').replace(/\n```$/m, '').trim();
        const topic = content.split('\n')[0].replace(/[#*]/g, '').trim().substring(0, 100);

        const post = await prisma.viralPost.upsert({
            where: { periodIdentifier: dayIdentifier },
            update: { content, topic, date: displayDate },
            create: {
                content,
                topic,
                date: displayDate,
                periodIdentifier: dayIdentifier,
                targetDate: now
            }
        });

        try {
            const { revalidatePath } = await import('next/cache');
            revalidatePath('/admin');
        } catch (e) { }

        return { success: true, post };
    } catch (error) {
        console.error("[generateViralLinkedInPost] Error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to generate post" };
    }
}
