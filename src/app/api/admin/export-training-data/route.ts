import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
    const user = await getUser()

    // Check if user is admin OR specifically ravibarnwal89@gmail.com
    const isAdminEmail = user?.email === 'ravibarnwal89@gmail.com'
    if (!user || (!isAdminEmail && user.role !== 'ADMIN')) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const goldSubmissions = await prisma.practiceSubmission.findMany({
            where: {
                isGoldStandard: true
            },
            include: {
                question: {
                    select: {
                        title: true,
                        description: true,
                        category: true,
                        solutionText: true,
                        sampleAnswer: true
                    }
                },
                reviews: {
                    where: {
                        type: 'EXPERT'
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1
                }
            }
        })

        if (goldSubmissions.length === 0) {
            return NextResponse.json({ message: "No gold standard data found to export" }, { status: 404 })
        }

        // Format for training (JSONL style)
        const exportData = goldSubmissions.map(submission => {
            const expertReview = submission.reviews[0]

            return {
                id: submission.id,
                context: {
                    question_title: submission.question.title,
                    question_description: submission.question.description,
                    category: submission.question.category,
                    ground_truth_guide: submission.question.solutionText,
                    ground_truth_sample: submission.question.sampleAnswer
                },
                user_submission: {
                    answer_text: submission.answerText,
                    timestamp: submission.createdAt
                },
                ai_evaluation_raw: submission.aiScore ? JSON.parse(submission.aiScore) : null,
                expert_correction: expertReview ? {
                    score: expertReview.score,
                    feedback: expertReview.content,
                    ai_accuracy_rating: expertReview.aiAccuracy,
                    reviewer_id: expertReview.reviewerId
                } : null
            }
        })

        // Generate JSONL string
        const jsonlString = exportData.map(item => JSON.stringify(item)).join('\n')

        // Return as a file download
        return new NextResponse(jsonlString, {
            headers: {
                'Content-Type': 'application/x-jsonlines',
                'Content-Disposition': `attachment; filename="prodsnap_training_data_${new Date().toISOString().split('T')[0]}.jsonl"`,
            },
        })

    } catch (error) {
        console.error("[Export] Error:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
