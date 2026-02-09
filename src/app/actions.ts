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
    // Note: Guests can use this (limit enforced client-side: 5 for guests, 10 for logged-in)

    const { getApiKeys } = await import("@/lib/ai/engine");
    const apiKeys = getApiKeys();

    if (apiKeys.length === 0) return { success: false, error: "AI Service unconfigured" }

    const { INTERVIEWER_CHAT_PROMPT } = await import("@/lib/ai/prompts");
    const systemPrompt = INTERVIEWER_CHAT_PROMPT(data.questionTitle, data.questionDescription);
    let lastError: any = null;

    try {
        for (const apiKey of apiKeys) {
            const isPerplexity = apiKey.startsWith("pplx-");

            try {
                if (isPerplexity) {
                    const messages: { role: "system" | "user" | "assistant", content: string }[] = [
                        { role: "system", content: systemPrompt }
                    ];

                    // Add history with strict alternating check
                    let lastRole: "user" | "assistant" | null = null;

                    for (const h of data.history) {
                        const currentRole = h.role === 'model' ? 'assistant' : 'user';

                        // Perplexity requires the first message after system to be 'user'
                        if (lastRole === null && currentRole === 'assistant') {
                            messages.push({ role: "user", content: "Can you provide a hint or some context?" });
                            lastRole = 'user';
                        }

                        // Strictly alternate: if same role as last, skip or merge (here we skip for safety)
                        if (currentRole !== lastRole) {
                            messages.push({
                                role: currentRole,
                                content: h.parts?.[0]?.text || ''
                            });
                            lastRole = currentRole;
                        }
                    }

                    // Current message must be user. If last was also user, we merge them.
                    if (lastRole === 'user') {
                        messages[messages.length - 1].content += `\n\n${data.userMessage}`;
                    } else {
                        messages.push({ role: "user", content: data.userMessage });
                    }

                    const res = await fetch("https://api.perplexity.ai/chat/completions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${apiKey}`
                        },
                        body: JSON.stringify({
                            model: "sonar",
                            messages,
                            temperature: 0.2,
                            max_tokens: 400
                        })
                    });

                    if (!res.ok) {
                        const errorText = await res.text();
                        throw new Error(`Perplexity Error: ${res.status} - ${errorText}`);
                    }

                    const result = await res.json();
                    let text = result.choices[0].message.content || "";

                    // FAILSAVE: Strip citations, remove bold/italics, and strip leading dashes/bullets
                    text = text.replace(/\[\d+\]/g, '')
                        .replace(/\*\*/g, '')
                        .replace(/\*/g, '')
                        .replace(/^\s*[-•]\s*/gm, '')
                        .trim();

                    return { success: true, text };
                } else {
                    // Gemini with model fallbacks
                    const { GoogleGenerativeAI } = await import("@google/generative-ai");
                    const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];

                    for (const modelId of modelsToTry) {
                        try {
                            const genAI = new GoogleGenerativeAI(apiKey);
                            const model = genAI.getGenerativeModel({ model: modelId });

                            const chat = model.startChat({
                                history: data.history.map(h => ({
                                    role: h.role,
                                    parts: h.parts
                                })),
                                generationConfig: {
                                    maxOutputTokens: 500,
                                },
                            });

                            const result = await chat.sendMessage(data.userMessage);
                            const response = await result.response;
                            return { success: true, text: response.text() };
                        } catch (e) {
                            console.warn(`[askClarifyingQuestion] Gemini model ${modelId} failed for current key, trying next...`);
                            lastError = e;
                            continue;
                        }
                    }
                }
            } catch (error: any) {
                console.error(`[askClarifyingQuestion] Key attempt failed:`, error.message);
                lastError = error;
                continue;
            }
        }
        throw lastError || new Error("All AI providers (Gemini & Perplexity) failed.");
    } catch (error: any) {
        console.error("[askClarifyingQuestion] FINAL Error:", error);
        return { success: false, error: "Interviewer is having trouble responding. Please try again." };
    }
}

export async function getInterviewerHint(data: {
    questionTitle: string,
    questionDescription: string,
    history: { role: 'user' | 'model', text: string }[]
}) {
    const user = await getUser()
    if (!user) return { success: false, error: "Please sign in to ask questions" }

    const { getApiKeys } = await import("@/lib/ai/engine");
    const apiKeys = getApiKeys();
    if (apiKeys.length === 0) return { success: false, error: "AI Service unconfigured" }

    const { HINT_PROMPT } = await import("@/lib/ai/prompts");
    const currentChat = data.history.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');
    const systemPrompt = HINT_PROMPT(data.questionTitle, data.questionDescription, currentChat);
    let lastError: any = null;

    try {
        for (const apiKey of apiKeys) {
            const isPerplexity = apiKey.startsWith("pplx-");

            try {
                if (isPerplexity) {
                    const res = await fetch("https://api.perplexity.ai/chat/completions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${apiKey}`
                        },
                        body: JSON.stringify({
                            model: "sonar",
                            messages: [
                                { role: "system", content: "You are a helpful PM interviewer giving brief hints." },
                                { role: "user", content: systemPrompt }
                            ],
                            temperature: 0.3,
                            max_tokens: 200
                        })
                    });

                    if (!res.ok) throw new Error(`Perplexity Error: ${res.status}`);

                    const result = await res.json();
                    let text = result.choices[0].message.content || "";

                    text = text.replace(/\[\d+\]/g, '')
                        .replace(/\*\*/g, '')
                        .replace(/\*/g, '')
                        .replace(/^\s*[-•]\s*/gm, '')
                        .trim();

                    return { success: true, text };
                } else {
                    const { GoogleGenerativeAI } = await import("@google/generative-ai");
                    const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];

                    for (const modelId of modelsToTry) {
                        try {
                            const genAI = new GoogleGenerativeAI(apiKey);
                            const model = genAI.getGenerativeModel({ model: modelId });

                            const result = await model.generateContent(systemPrompt);
                            const response = await result.response;
                            return { success: true, text: response.text() };
                        } catch (e) {
                            console.warn(`[getInterviewerHint] Gemini model ${modelId} failed, trying next...`);
                            lastError = e;
                            continue;
                        }
                    }
                }
            } catch (error: any) {
                console.error(`[getInterviewerHint] Key attempt failed:`, error.message);
                lastError = error;
                continue;
            }
        }
        throw lastError || new Error("All AI providers (Gemini & Perplexity) failed.");
    } catch (error) {
        console.error(`[getInterviewerHint] FINAL Error:`, error);
        return { success: false, error: "Interviewer is currently busy." };
    }
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

// Get all unique emails for newsletter (Users + Direct Subscribers)
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

export async function generateNewsletterDraft(prompt: string) {
    const adminUser = await getUser()
    const isAdminEmail = adminUser?.email === 'ravibarnwal89@gmail.com'
    if (!adminUser || (!isAdminEmail && adminUser.role !== 'ADMIN')) {
        return { success: false, error: "Unauthorized" }
    }

    const { getApiKeys } = await import("@/lib/ai/engine");
    const allKeys = getApiKeys();
    const perplexityKey = allKeys.find(k => k.startsWith("pplx-"));
    const geminiKeys = allKeys.filter(k => !k.startsWith("pplx-"));

    console.log(`[generateNewsletterDraft] Input context: ${prompt.substring(0, 50)}...`);

    // Helper to clean up formatting (only removes the Subject prefix if it persists)
    const cleanText = (text: string) => {
        return text
            .replace(/^Subject: /i, '')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    };

    // 1. Try Perplexity First (Most stable for this prompt right now)
    if (perplexityKey) {
        try {
            console.log(`[generateNewsletterDraft] Attempting Perplexity...`);
            const res = await fetch("https://api.perplexity.ai/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${perplexityKey}`
                },
                body: JSON.stringify({
                    model: "sonar",
                    messages: [
                        {
                            role: "system",
                            content: `You are an expert Product Management newsletter writer for "Prodsnap Daily Digest". 
                            Your tone is professional, insightful, and "PM-first". 
                            STRICT RULES: 
                            1. Be extremely CONCISE and precise. Use short BULLETED POINTS only.
                            2. NO long text/paragraphs. 
                            3. Use Markdown for bullets (-) and include 1-2 relevant images using Markdown ![]() or <img> tags.
                            4. Start the response with "Subject: [Title]" on the first line.`
                        },
                        {
                            role: "user",
                            content: `Write a sharp, bulleted newsletter draft about: "${prompt}"`
                        }
                    ],
                    temperature: 0.2
                })
            });

            if (res.ok) {
                const data = await res.json();
                const text = data.choices[0].message.content;

                const subjectMatch = text.match(/Subject: (.*)/);
                const rawSubject = subjectMatch ? subjectMatch[1] : "Weekly Prodsnap Update";
                const rawContent = text.replace(/Subject: .*/, '').trim();

                const subject = cleanText(rawSubject);
                const content = cleanText(rawContent);

                console.log(`[generateNewsletterDraft] Perplexity success!`);
                return { success: true, subject, content };
            }
            console.error(`[generateNewsletterDraft] Perplexity status: ${res.status}`);
        } catch (err) {
            console.error(`[generateNewsletterDraft] Perplexity error:`, err);
        }
    }

    // 2. Fallback to Gemini if Perplexity is missing or fails
    if (geminiKeys.length > 0) {
        try {
            const { GoogleGenerativeAI } = await import("@google/generative-ai");
            const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-flash-latest"];
            let lastError: any = null;

            for (const modelId of modelsToTry) {
                try {
                    console.log(`[generateNewsletterDraft] Falling back to Gemini: ${modelId}`);
                    const genAI = new GoogleGenerativeAI(geminiKeys[0]);
                    const model = genAI.getGenerativeModel({ model: modelId });

                    const finalPrompt = `
You are an expert Product Management newsletter writer for "Prodsnap Daily Digest".
Your tone is professional, insightful, and "PM-first".
Write an engaging news briefing or newsletter based on: "${prompt}"

STRICT RULES:
- First line: Subject: [Catchy Subject]
- Body must be CONCISE bullet points. No long paragraphs.
- Use Markdown bullets (-) and include 1-2 images where possible using Markdown ![]() or <img> tags.
`;
                    const result = await model.generateContent(finalPrompt);
                    const response = await result.response;
                    const text = response.text();

                    if (!text) throw new Error("Empty AI response");

                    const subjectMatch = text.match(/Subject: (.*)/);
                    const rawSubject = subjectMatch ? subjectMatch[1] : "Weekly Update";
                    const rawContent = text.replace(/Subject: .*/, '').trim();

                    const subject = cleanText(rawSubject);
                    const content = cleanText(rawContent);

                    return { success: true, subject, content };
                } catch (err: any) {
                    lastError = err;
                }
            }
            throw lastError || new Error("All AI models failed");
        } catch (error: any) {
            console.error("[generateNewsletterDraft] Final error:", error);
            return { success: false, error: error?.message || "AI service error" };
        }
    }

    return { success: false, error: "No AI keys configured" };
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
        const post = await (prisma as any).viralPost.findFirst({
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
        const apiKeys = getApiKeys();
        const perplexityKey = apiKeys.find(key => key.startsWith('pplx-'));

        if (!perplexityKey) {
            return { success: false, error: "Perplexity key missing" };
        }

        const now = new Date();
        const istDate = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
        const dayIdentifier = istDate.toISOString().split('T')[0];
        const displayDate = istDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const prompt = `
            Research a brand new (past 48 hours), extremely exciting AI development, breakthrough, or research paper. 
            It could be related to agents, LLMs, robotics, or computer vision.
            Write a viral LinkedIn post about it as a world-class storyteller.
            
            Structure:
            1. Hook: Start with a mind-blowing fact or a "Wait, this actually happened?" style hook.
            2. The Story: Explain the development in a way that creates hype but stays grounded in the technology/research.
            3. Detailed Research: Mention the specific paper name, researchers, or company and what the core breakthrough is.
            4. PM/Product Perspective: How does this change the product landscape?
            5. Call to Action: Ask a thought-provoking question to drive comments.
            6. Hashtags: Use a mix of broad and niche AI hashtags.
            
            Tone: Viral storyteller, high energy, formatting with line breaks for readability.
            
            Return ONLY the post content text. No conversational filler.
        `;

        const res = await fetch("https://api.perplexity.ai/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${perplexityKey}`
            },
            body: JSON.stringify({
                model: "sonar",
                messages: [
                    { role: "system", content: "You are a world-class LinkedIn storyteller and AI researcher. You write posts that go viral by being informative yet highly engaging." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7
            })
        });

        if (!res.ok) throw new Error(`AI error: ${res.status}`);
        const data = await res.json();
        const content = data.choices[0].message.content;

        // Extract a title/topic from the content (first line or summary)
        const topic = content.split('\n')[0].replace(/[#*]/g, '').trim().substring(0, 100);

        const post = await (prisma as any).viralPost.upsert({
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

        return { success: true, post };
    } catch (error) {
        console.error("[generateViralLinkedInPost] Error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to generate post" };
    }
}
