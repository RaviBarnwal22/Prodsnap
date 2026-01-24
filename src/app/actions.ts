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

    // Check if user is admin OR specifically ravibarnwal89@gmail.com
    const isAdminEmail = user?.email === 'ravibarnwal89@gmail.com'
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

    // Check if user is admin OR specifically ravibarnwal89@gmail.com
    const isAdminEmail = user?.email === 'ravibarnwal89@gmail.com'
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

    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const { INTERVIEWER_CHAT_PROMPT } = await import("@/lib/ai/prompts");

    function getApiKeys(): string[] {
        const keys: string[] = [];
        let i = 1;
        while (process.env[`GEMINI_API_KEY_${i}`]) {
            keys.push(process.env[`GEMINI_API_KEY_${i}`] as string);
            i++;
        }
        if (keys.length === 0 && process.env.GEMINI_API_KEY) {
            keys.push(process.env.GEMINI_API_KEY);
        }
        return keys.filter(key => key.trim() !== "");
    }

    const apiKeys = getApiKeys();
    if (apiKeys.length === 0) return { success: false, error: "AI Service unconfigured" }

    const systemPrompt = INTERVIEWER_CHAT_PROMPT(data.questionTitle, data.questionDescription);

    // AI Model Cycling Logic
    let lastError = "All AI models are currently saturated.";
    let totalAttempts = 0;

    for (const key of apiKeys) {
        if (key.startsWith("pplx-")) continue;

        // Use only v1beta - v1 doesn't work with newer Google AI Studio keys
        const apiVersions = ["v1beta"];
        // Use only models confirmed to work with generateContent on v1beta
        const models = ["gemini-1.5-flash", "gemini-1.5-pro"];

        for (const version of apiVersions) {
            for (const modelName of models) {
                totalAttempts++;
                try {
                    const contents = [];
                    let lastRole = "model";

                    // Handle first turn vs subsequent turns
                    if (data.history.length === 0) {
                        contents.push({
                            role: "user",
                            parts: [{ text: `INSTRUCTIONS: ${systemPrompt}\n\nUSER QUESTION: ${data.userMessage}` }]
                        });
                    } else {
                        // For subsequent turns, we re-inject instructions to keep context strong
                        contents.push({
                            role: "user",
                            parts: [{ text: `REMINDER OF YOUR ROLE & CONTEXT: ${systemPrompt}` }]
                        });
                        contents.push({
                            role: "model",
                            parts: [{ text: "Understood. I'm continuing as your interviewer." }]
                        });

                        for (const m of data.history) {
                            const currentRole = m.role === 'user' ? 'user' : 'model';
                            if (currentRole !== lastRole) {
                                contents.push({
                                    role: currentRole,
                                    parts: [{ text: m.parts?.[0]?.text || '' }]
                                });
                                lastRole = currentRole;
                            }
                        }

                        if (lastRole === "user") {
                            contents[contents.length - 1].parts[0].text += `\n\n${data.userMessage}`;
                        } else {
                            contents.push({
                                role: "user",
                                parts: [{ text: data.userMessage }]
                            });
                        }
                    }

                    const response = await fetch(`https://generativelanguage.googleapis.com/${version}/models/${modelName}:generateContent?key=${key}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents,
                            generationConfig: {
                                temperature: 0.7,
                                maxOutputTokens: 800,
                            }
                        })
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        const msg = errorData.error?.message || response.statusText;

                        // Always capture the error for diagnostics
                        lastError = `${modelName}: ${msg}`;

                        if (msg.toLowerCase().includes("not found") || msg.toLowerCase().includes("not supported")) continue;
                        if (msg.includes("API key not valid")) {
                            lastError = "API key invalid or expired.";
                            break;
                        }
                        if (response.status === 429) {
                            lastError = "Rate limit exhausted. Wait 1 min or add another API key.";
                            continue;
                        }
                        continue;
                    }

                    const result = await response.json();
                    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) return { success: true, text };

                    if (result.candidates?.[0]?.finishReason === "SAFETY") {
                        return { success: false, error: "SAFETY_BLOCK: Please rephrase." };
                    }
                } catch (error: any) {
                    lastError = error.message || String(error);
                    console.error(`[askClarifyingQuestion] ${modelName} error:`, lastError);
                }
            }
        }
    }

    return {
        success: false,
        error: `Interviewer is having trouble: ${lastError} (Try count: ${totalAttempts})`
    };
}

export async function getInterviewerHint(data: {
    questionTitle: string,
    questionDescription: string,
    history: { role: 'user' | 'model', text: string }[]
}) {
    const user = await getUser()
    if (!user) return { success: false, error: "Please login to ask questions" }

    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const { HINT_PROMPT } = await import("@/lib/ai/prompts");

    function getApiKeys(): string[] {
        const keys: string[] = [];
        let i = 1;
        while (process.env[`GEMINI_API_KEY_${i}`]) {
            keys.push(process.env[`GEMINI_API_KEY_${i}`] as string);
            i++;
        }
        if (keys.length === 0 && process.env.GEMINI_API_KEY) {
            keys.push(process.env.GEMINI_API_KEY);
        }
        return keys.filter(key => key.trim() !== "");
    }

    const apiKeys = getApiKeys();
    if (apiKeys.length === 0) return { success: false, error: "AI Service unconfigured" }

    const currentChat = data.history.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');
    const systemPrompt = HINT_PROMPT(data.questionTitle, data.questionDescription, currentChat);

    for (const key of apiKeys) {
        try {
            const genAI = new GoogleGenerativeAI(key);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

            const result = await model.generateContent(systemPrompt);
            const response = await result.response;
            return { success: true, text: response.text() };
        } catch (error) {
            console.error(`Hint error with key:`, error);
        }
    }

    return { success: false, error: "Interviewer is currently busy." };
}
