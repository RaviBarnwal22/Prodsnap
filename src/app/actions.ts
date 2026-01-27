'use server'

import { prisma } from "@/lib/prisma"
import { evaluateAnswer } from "@/lib/ai/engine"
import { revalidatePath } from "next/cache"
import { getUser } from "@/lib/auth"
import { sendContactFormNotification, sendSupportReply } from "@/lib/email"

export async function submitAnswer(questionId: string, answer: string, elapsedTimeSeconds?: number, chatContext?: string) {
    const user = await getUser()

    if (!user) {
        return { success: false, error: "Please login to submit" }
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

    try {
        await prisma.userActivity.create({
            data: {
                userId: user?.id || null,
                page,
                action,
                metadata
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
        return { success: false, error: "Please login to submit feedback" }
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
    const user = await getUser()
    if (!user) return { success: false, error: "Please login to ask questions" }

    const { INTERVIEWER_CHAT_PROMPT } = await import("@/lib/ai/prompts");

    const apiKey = process.env.PERPLEXITY_API_KEY || process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY_2;
    if (!apiKey) return { success: false, error: "AI Service unconfigured" }

    const isPerplexity = apiKey.startsWith("pplx-");
    const systemPrompt = INTERVIEWER_CHAT_PROMPT(data.questionTitle, data.questionDescription);

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
                    temperature: 0.2, // Lower temperature for more consistent, to-the-point responses
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
            // Fallback to Gemini if no Perplexity key
            const { GoogleGenerativeAI } = await import("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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
        }
    } catch (error: any) {
        console.error("[askClarifyingQuestion] Error:", error);
        return { success: false, error: "Interviewer is having trouble responding. Please try again." };
    }
}

export async function getInterviewerHint(data: {
    questionTitle: string,
    questionDescription: string,
    history: { role: 'user' | 'model', text: string }[]
}) {
    const user = await getUser()
    if (!user) return { success: false, error: "Please login to ask questions" }

    const { HINT_PROMPT } = await import("@/lib/ai/prompts");

    const apiKey = process.env.PERPLEXITY_API_KEY || process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY_2;
    if (!apiKey) return { success: false, error: "AI Service unconfigured" }

    const currentChat = data.history.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');
    const systemPrompt = HINT_PROMPT(data.questionTitle, data.questionDescription, currentChat);
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

            // FAILSAVE: Strip citations, remove bold/italics, and strip leading dashes/bullets
            text = text.replace(/\[\d+\]/g, '')
                .replace(/\*\*/g, '')
                .replace(/\*/g, '')
                .replace(/^\s*[-•]\s*/gm, '')
                .trim();

            return { success: true, text };
        } else {
            const { GoogleGenerativeAI } = await import("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

            const result = await model.generateContent(systemPrompt);
            const response = await result.response;
            return { success: true, text: response.text() };
        }
    } catch (error) {
        console.error(`Hint error:`, error);
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
