'use server'

import { prisma } from "@/lib/prisma"
import { evaluateAnswer } from "@/lib/ai/engine"
import { revalidatePath } from "next/cache"
import { getUser } from "@/lib/auth"
import { sendContactFormNotification } from "@/lib/email"

export async function submitAnswer(questionId: string, answer: string, elapsedTimeSeconds?: number) {
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
        aiResponse = await evaluateAnswer(question.title, answer, elapsedTimeSeconds)
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
