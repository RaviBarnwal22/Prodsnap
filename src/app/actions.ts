'use server'

import { prisma } from "@/lib/prisma"
import { evaluateAnswer } from "@/lib/ai/engine"
import { revalidatePath } from "next/cache"
import { getUser } from "@/lib/auth"
import { sendContactFormNotification, sendSupportReply, sendAdminManualReply } from "@/lib/email"

export async function submitAnswer(questionId: string, answer: string, elapsedTimeSeconds?: number, chatContext?: string) {
    const user = await getUser()

    if (!user) {
        return { success: false, error: "Please sign in to submit" }
    }

    const userId = user.id
    console.log(`[submitAnswer] Starting: questionId=${questionId}, userId=${userId}, time=${elapsedTimeSeconds}s`);

    // 1. Fetch Question
    const question = await prisma.practiceQuestion.findUnique({
        where: { id: questionId }
    })

    if (!question) {
        console.error(`[submitAnswer] Question NOT FOUND: ${questionId}`);
        throw new Error("Question not found")
    }
    console.log(`[submitAnswer] Question found: ${question.title}`);

    // 2. Call AI Engine
    let aiResponse;
    try {
        console.log(`[submitAnswer] Calling AI Engine...`);
        aiResponse = await evaluateAnswer(question.title, answer, elapsedTimeSeconds, chatContext)
        console.log(`[submitAnswer] AI Engine success`);
    } catch (error) {
        console.error("[submitAnswer] AI Error", error)
        return { success: false, error: "AI Service Unavailable" }
    }

    // 3. Save Submission
    try {
        console.log(`[submitAnswer] Creating submission in DB...`);
        const submission = await prisma.practiceSubmission.create({
            data: {
                userId,
                questionId,
                answerText: answer,
                aiScore: JSON.stringify(aiResponse),
                timeSpent: elapsedTimeSeconds || 0
            }
        })
        console.log(`[submitAnswer] Submission created: ${submission.id}`);

        revalidatePath(`/practice/${questionId}`)
        return { success: true, submissionId: submission.id, aiResponse }
    } catch (dbError: unknown) {
        const error = dbError as { code?: string; meta?: { field_name?: string }; message?: string };
        console.error("[submitAnswer] DB ERROR details:", {
            code: error.code,
            meta: error.meta,
            message: error.message,
            userId,
            questionId
        });
        // Specifically check for FK errors to provide better info
        if (error.code === 'P2003') {
            return { success: false, error: `Database constraint error: ${error.meta?.field_name || 'Foreign key violation'}. Please ensure you are logged in correctly.` }
        }
        throw dbError; // Rethrow others as 500
    }
}

export async function submitContactForm(data: { name: string, email: string, message: string }) {
    console.log(`[submitContactForm] Received submission from: ${data.name} <${data.email}>`);
    console.log(`[submitContactForm] Message: ${data.message}`);

    try {
        // Save to database
        await prisma.contactSubmission.create({
            data: {
                name: data.name,
                email: data.email,
                message: data.message
            }
        })
        console.log(`[submitContactForm] Saved to database`)

        // Send email notification to admin
        try {
            await sendContactFormNotification({
                name: data.name,
                email: data.email,
                message: data.message
            })
            console.log(`[submitContactForm] Email notification sent to admin`)
        } catch (emailError) {
            console.error("[submitContactForm] Email send error:", emailError);
            // Don't fail the whole operation if email fails
        }

        return { success: true }
    } catch (error) {
        console.error("[submitContactForm] Error:", error);
        return { success: false, error: "Failed to process your request." }
    }
}

// Track user activity (server action)
export async function trackActivity(page: string, action: string, metadata?: string) {
    const user = await getUser()
    const { headers } = await import('next/headers')
    const headerLists = await headers()

    const ip = headerLists.get('x-forwarded-for') || 'unknown'
    const ua = headerLists.get('user-agent') || 'unknown'

    try {
        await prisma.userActivity.create({
            data: {
                userId: user?.id || null,
                page,
                action,
                metadata,
                ipAddress: ip,
                userAgent: ua
            }
        })
    } catch (error) {
        console.error("[trackActivity] Error:", error);
    }
}

// Submit practice feedback (NPS style)
export async function submitPracticeFeedback(data: {
    experience: string
    comments: string
    npsScore: number
    submissionId?: string
}) {
    const user = await getUser()

    if (!user) {
        return { success: false, error: "Please sign in to submit feedback" }
    }

    try {
        await prisma.practiceFeedback.create({
            data: {
                userId: user.id,
                submissionId: data.submissionId,
                experience: data.experience,
                comments: data.comments || '',
                npsScore: data.npsScore
            }
        })

        console.log(`[submitPracticeFeedback] Feedback saved for user: ${user.id}`)
        return { success: true }
    } catch (error) {
        console.error("[submitPracticeFeedback] Error:", error);
        return { success: false, error: "Failed to save feedback" }
    }
}
// Submit expert review (Admin only)
export async function submitExpertReview(data: {
    submissionId: string,
    score: number,
    content: string,
    aiAccuracy: number,
    isGoldStandard: boolean
}) {
    const user = await getUser()

    const isAdminEmail = user?.email === (process.env.ADMIN_EMAIL || 'ravibarnwal89@gmail.com')
    if (!user || (!isAdminEmail && user.role !== 'ADMIN')) {
        return { success: false, error: "Only admins can submit expert reviews" }
    }

    try {
        // 1. Create the expert review
        await prisma.review.create({
            data: {
                submissionId: data.submissionId,
                reviewerId: user.id,
                type: "EXPERT",
                score: data.score,
                content: data.content,
                aiAccuracy: data.aiAccuracy
            }
        })

        // 2. Update the submission's gold standard status
        await prisma.practiceSubmission.update({
            where: { id: data.submissionId },
            data: { isGoldStandard: data.isGoldStandard }
        })

        revalidatePath('/admin')
        return { success: true }
    } catch (error) {
        console.error("[submitExpertReview] Error:", error);
        return { success: false, error: "Failed to save expert review" }
    }
}

// Reply to support inquiry (Admin only)
export async function replyToSupport(data: {
    submissionId: string,
    replyMessage: string
}) {
    const user = await getUser()

    const isAdminEmail = user?.email === (process.env.ADMIN_EMAIL || 'ravibarnwal89@gmail.com')
    if (!user || (!isAdminEmail && user.role !== 'ADMIN')) {
        return { success: false, error: "Only admins can reply to support inquiries" }
    }

    try {
        // 1. Fetch the original submission
        const submission = await prisma.contactSubmission.findUnique({
            where: { id: data.submissionId }
        })

        if (!submission) {
            return { success: false, error: "Submission not found" }
        }

        // 2. Send the email
        await sendSupportReply({
            name: submission.name,
            email: submission.email,
            originalMessage: submission.message,
            replyMessage: data.replyMessage
        })

        // 3. Update the database
        await prisma.contactSubmission.update({
            where: { id: data.submissionId },
            data: {
                reply: data.replyMessage,
                repliedAt: new Date()
            }
        })

        revalidatePath('/admin')
        return { success: true }
    } catch (error) {
        console.error("[replyToSupport] Error:", error);
        return { success: false, error: "Failed to send reply" }
    }
}
// Send manual email reply to any user
export async function sendManualUserReply(data: {
    email: string
    name: string
    subject: string
    message: string
    originalFeedback?: string
}) {
    const user = await getUser()

    const isAdminEmail = user?.email === (process.env.ADMIN_EMAIL || 'ravibarnwal89@gmail.com')
    if (!user || (!isAdminEmail && user.role !== 'ADMIN')) {
        return { success: false, error: "Only admins can send manual replies" }
    }

    try {
        await sendAdminManualReply({
            name: data.name,
            email: data.email,
            subject: data.subject,
            replyMessage: data.message,
            originalMessage: data.originalFeedback
        })

        return { success: true }
    } catch (error) {
        console.error("[sendManualUserReply] Error:", error);
        return { success: false, error: "Failed to send email" }
    }
}

export async function getUserSkillScores() {
    const user = await getUser()
    if (!user) return { success: false, error: "Not logged in" }

    try {
        const submissions = await prisma.practiceSubmission.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: { aiScore: true }
        })

        if (submissions.length === 0) return { success: true, scores: null }

        // Average out the scores
        const totals = {
            comprehend_goal: 0,
            identify_users: 0,
            report_needs: 0,
            cut_prioritization: 0,
            list_solutions: 0,
            evaluate_tradeoffs: 0
        }

        let validCount = 0
        submissions.forEach(sub => {
            try {
                const results = JSON.parse(sub.aiScore || '{}')
                if (results.scores) {
                    Object.keys(totals).forEach(key => {
                        // @ts-ignore
                        totals[key] += results.scores[key] || 0
                    })
                    validCount++
                }
            } catch (e) {
                console.error("Parse error in skill scores", e)
            }
        })

        if (validCount === 0) return { success: true, scores: null }

        const averages = Object.keys(totals).map(key => ({
            subject: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            // @ts-ignore
            A: Number((totals[key] / validCount).toFixed(1)),
            fullMark: 5
        }))

        return { success: true, scores: averages }

    } catch (error) {
        console.error("Error fetching skill scores", error)
        return { success: false, error: "Failed to fetch scores" }
    }
}

export async function askClarifyingQuestion(data: {
    questionTitle: string,
    questionDescription: string,
    userMessage: string,
    history: { role: 'user' | 'model', parts: { text: string }[] }[]
}) {
    const { getApiKeys } = await import("@/lib/ai/engine");
    const { gemini: geminiKeys, groq: groqKeys } = getApiKeys();

    if (geminiKeys.length === 0 && groqKeys.length === 0) return { success: false, error: "AI Service unconfigured" }

    const { INTERVIEWER_CHAT_PROMPT } = await import("@/lib/ai/prompts");
    const systemPrompt = INTERVIEWER_CHAT_PROMPT(data.questionTitle, data.questionDescription);

    // Try Gemini First
    for (const key of geminiKeys) {
        try {
            const { GoogleGenerativeAI } = await import("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(key);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const chat = model.startChat({
                history: data.history.map(h => ({ role: h.role, parts: h.parts })),
            });
            const result = await chat.sendMessage(data.userMessage);
            return { success: true, text: result.response.text() };
        } catch (e) {
            console.warn(`[askClarifyingQuestion] Gemini failed, trying next...`);
        }
    }

    // Try Groq backup
    for (const key of groqKeys) {
        try {
            const messages = [
                { role: "system", content: systemPrompt },
                ...data.history.map(h => ({ role: h.role === 'model' ? 'assistant' : 'user', content: h.parts[0].text })),
                { role: "user", content: data.userMessage }
            ];
            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages,
                    temperature: 0.2
                })
            });
            if (res.ok) {
                const result = await res.json();
                return { success: true, text: result.choices[0].message.content };
            }
        } catch (e) { }
    }

    return { success: false, error: "AI providers failed. Please try again." };
}

export async function getInterviewerHint(data: {
    questionTitle: string,
    questionDescription: string,
    history: { role: 'user' | 'model', text: string }[]
}) {
    const user = await getUser()
    if (!user) return { success: false, error: "Please sign in to ask questions" }

    const { getApiKeys } = await import("@/lib/ai/engine");
    const { gemini: geminiKeys, groq: groqKeys } = getApiKeys();
    if (geminiKeys.length === 0 && groqKeys.length === 0) return { success: false, error: "AI Service unconfigured" }

    const { HINT_PROMPT } = await import("@/lib/ai/prompts");
    const currentChat = data.history.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');
    const systemPrompt = HINT_PROMPT(data.questionTitle, data.questionDescription, currentChat);

    for (const key of geminiKeys) {
        try {
            const { GoogleGenerativeAI } = await import("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(key);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const result = await model.generateContent(systemPrompt);
            return { success: true, text: result.response.text() };
        } catch (e) { }
    }

    for (const key of groqKeys) {
        try {
            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [{ role: "user", content: systemPrompt }]
                })
            });
            if (res.ok) {
                const result = await res.json();
                return { success: true, text: result.choices[0].message.content };
            }
        } catch (e) { }
    }

    return { success: false, error: "Interviewer is currently busy." };
}

export async function generateNewsletterDraft(prompt: string) {
    const adminUser = await getUser()
    const isAdminEmail = adminUser?.email === (process.env.ADMIN_EMAIL || 'ravibarnwal89@gmail.com')
    if (!adminUser || (!isAdminEmail && adminUser.role !== 'ADMIN')) {
        return { success: false, error: "Unauthorized" }
    }

    const { getApiKeys } = await import("@/lib/ai/engine");
    const { gemini: geminiKeys, groq: groqKeys } = getApiKeys();

    const cleanText = (text: string) => {
        return text.replace(/^Subject: /i, '').replace(/\n{3,}/g, '\n\n').trim();
    };

    const finalPrompt = `You are an expert PM newsletter writer. Write a sharp, bulleted newsletter draft about: "${prompt}".
STRICT RULES:
1. Start with "Subject: [Title]" on the first line.
2. Use CONCISE bullet points only.
3. Include relevant insights for PMs.`;

    for (const key of geminiKeys) {
        try {
            const { GoogleGenerativeAI } = await import("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(key);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const result = await model.generateContent(finalPrompt);
            const text = result.response.text();

            const subjectMatch = text.match(/Subject: (.*)/);
            const subject = cleanText(subjectMatch ? subjectMatch[1] : "Prodsnap Daily Digest");
            const content = cleanText(text.replace(/Subject: .*/, ''));
            return { success: true, subject, content };
        } catch (e) { }
    }

    for (const key of groqKeys) {
        try {
            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [{ role: "user", content: finalPrompt }]
                })
            });
            if (res.ok) {
                const data = await res.json();
                const text = data.choices[0].message.content;
                const subjectMatch = text.match(/Subject: (.*)/);
                const subject = cleanText(subjectMatch ? subjectMatch[1] : "Prodsnap Daily Digest");
                const content = cleanText(text.replace(/Subject: .*/, ''));
                return { success: true, subject, content };
            }
        } catch (e) { }
    }

    return { success: false, error: "No AI keys configured or service failed" };
}

export async function logEmailEvent(recipient: string, type: string, subject: string) {
    console.log(`[logEmailEvent] Manual log: ${type} to ${recipient}`);
    try {
        await prisma.emailLog.create({
            data: {
                recipient,
                type: type.toLowerCase(),
                subject,
                status: 'success'
            }
        });
        return { success: true };
    } catch (error) {
        console.error('[logEmailEvent] Failed:', error);
        return { success: false };
    }
}

export async function checkUserExists(email: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email }
        })
        return { exists: !!user }
    } catch (error) {
        console.error("[checkUserExists] Error:", error)
        return { exists: false, error: "Database error" }
    }
}

export async function subscribeToNewsletter(email: string) {
    if (!email || !email.includes('@')) {
        return { success: false, error: "Invalid email" }
    }

    try {
        await (prisma as any).newsletterSubscriber.upsert({
            where: { email: email.toLowerCase() },
            update: { isActive: true },
            create: { email: email.toLowerCase() }
        })
        return { success: true }
    } catch (error) {
        console.error("[subscribeToNewsletter] Error:", error)
        return { success: false, error: "Failed to subscribe" }
    }
}

export async function getNewsletterEmails() {
    const adminUser = await getUser()
    const isAdminEmail = adminUser?.email === 'ravibarnwal89@gmail.com'
    if (!adminUser || (!isAdminEmail && adminUser.role !== 'ADMIN')) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const [users, subscribers] = await Promise.all([
            prisma.user.findMany({ select: { email: true } }),
            (prisma as any).newsletterSubscriber.findMany({
                where: { isActive: true },
                select: { email: true }
            })
        ])

        const allEmails = new Set([
            ...users.map((u: any) => u.email.toLowerCase()),
            ...subscribers.map((s: any) => s.email.toLowerCase())
        ])

        return { success: true, emails: Array.from(allEmails) }
    } catch (error) {
        console.error("[getNewsletterEmails] Error:", error)
        return { success: false, error: "Failed to fetch emails" }
    }
}

export async function broadcastNewsletter(data: { subject: string, content: string }) {
    const adminUser = await getUser()
    const isAdminEmail = adminUser?.email === 'ravibarnwal89@gmail.com'
    if (!adminUser || (!isAdminEmail && adminUser.role !== 'ADMIN')) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const emailRes = await getNewsletterEmails();
        if (!emailRes.success || !emailRes.emails) {
            return { success: false, error: "Could not fetch mailing list" };
        }

        const { sendBulkEmail } = await import("@/lib/email");
        const { marked } = await import('marked');

        // Convert markdown to HTML for email
        const htmlBody = `
            <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                ${await marked.parse(data.content)}
                <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="font-size: 12px; color: #999; text-align: center;">
                    You are receiving this because you subscribed to Prodsnap or registered on our platform.
                </p>
            </div>
        `;

        const results = await sendBulkEmail({
            recipients: emailRes.emails,
            subject: data.subject,
            html: htmlBody,
            type: 'newsletter'
        });

        return { success: true, sentCount: results.success, failedCount: results.failed, errors: results.errors };
    } catch (error) {
        console.error("[broadcastNewsletter] Error:", error);
        return { success: false, error: "Failed to broadcast newsletter" };
    }
}

export async function getLatestViralPost() {
    try {
        let db = (prisma as any);
        if (!db.viralPost) {
            const { PrismaClient } = await import('@prisma/client');
            db = new PrismaClient();
        }
        if (!db.viralPost) return { success: true, post: null };

        const post = await db.viralPost.findFirst({
            orderBy: { targetDate: 'desc' }
        });
        return { success: true, post };
    } catch (error) {
        console.error("[getLatestViralPost] Error:", error);
        return { success: false, error: "Failed to fetch post" };
    }
}

export async function generateViralLinkedInPostManual() {
    const user = await getUser();
    if (!user || user.role !== 'ADMIN') {
        return { success: false, error: "Unauthorized" };
    }
    return await generateViralLinkedInPost();
}

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
                const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
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

        let db = (prisma as any);
        if (!db.viralPost) {
            const { PrismaClient } = await import('@prisma/client');
            db = new PrismaClient();
        }

        const post = await db.viralPost.upsert({
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
