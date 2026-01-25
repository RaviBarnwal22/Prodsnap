import { prisma } from "@/lib/prisma"
import { Header } from "@/components/Header"
import { PracticeQuestionClient } from "@/components/PracticeQuestionClient"
import { getUser } from "@/lib/auth"
import { PracticeHistory } from "@/components/PracticeHistory"
import { hasActiveSubscription } from "@/lib/subscription"
import { PracticeLockOverlay } from "@/components/PracticeLockOverlay"
import Link from "next/link"
import { Crown, Lock, Unlock } from "lucide-react"

export default async function QuestionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const user = await getUser()
    const question = await prisma.practiceQuestion.findUnique({
        where: { id }
    })

    if (!question) {
        return <div>Question not found</div>
    }

    // Fetch user's practice history for this question
    let submissionHistory: any[] = []
    if (user) {
        submissionHistory = await prisma.practiceSubmission.findMany({
            where: {
                userId: user.id,
                questionId: id
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
    }

    const latestSubmission = submissionHistory[0] || null

    const isPremium = await hasActiveSubscription()
    const isAdmin = user?.email === 'ravibarnwal89@gmail.com' || (user as any)?.role === 'ADMIN'
    const hasFullAccess = isPremium || isAdmin

    // Calculate if this is the "First Case" of the category to allow free viewing
    const categoryQuestions = await prisma.practiceQuestion.findMany({
        where: { category: question.category },
        select: { id: true, difficulty: true }
    })

    const difficultyOrder: Record<string, number> = { 'easy': 1, 'Easy': 1, 'medium': 2, 'Medium': 2, 'hard': 3, 'Hard': 3 }
    categoryQuestions.sort((a, b) => {
        const orderA = difficultyOrder[a.difficulty] || 999
        const orderB = difficultyOrder[b.difficulty] || 999
        if (orderA !== orderB) return orderA - orderB
        return a.id.localeCompare(b.id) // Matches page.tsx sort
    })

    const isFirstCase = categoryQuestions[0]?.id === id
    const isLocked = !isFirstCase && !hasFullAccess

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Header />
            <main className="container mx-auto px-4 py-16 max-w-7xl">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left Column: Question Details */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border shadow-sm sticky top-24 overflow-hidden relative">
                            {isLocked && (
                                <PracticeLockOverlay
                                    category={question.category}
                                    userEmail={user?.email}
                                    userName={user?.firstName || user?.name || ''}
                                />
                            )}

                            <div className="mb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-gray-500 border border-gray-200 dark:border-gray-700">
                                    {question.category.replace(/_/g, ' ')}
                                </span>
                            </div>
                            <h1 className="text-3xl font-black mb-6 leading-tight">{question.title}</h1>

                            <div className={isLocked ? "blur-md select-none opacity-40 pointer-events-none" : ""}>
                                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                                    {question.description}
                                </p>

                                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                                    <h3 className="font-black text-sm uppercase tracking-widest text-gray-400 mb-4">Interviewer Tips</h3>
                                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-3">
                                        <li className="flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                            Clarify the business goal first
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                            Define and prioritize user segments
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                            Focus on 2-3 high-impact pain points
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {!isLocked && (
                            <PracticeHistory history={submissionHistory.map(s => ({
                                id: s.id,
                                answerText: s.answerText,
                                aiScore: s.aiScore || undefined,
                                createdAt: s.createdAt.toISOString()
                            }))} />
                        )}
                    </div>

                    {/* Right Column: Interaction Hub */}
                    <div className="md:col-span-2">
                        <PracticeQuestionClient
                            questionId={question.id}
                            questionTitle={question.title}
                            description={question.description}
                            userId={user?.id}
                            userEmail={user?.email}
                            userName={user?.firstName || user?.name || ''}
                            category={question.category}
                            solutionText={question.solutionText || undefined}
                            sampleAnswer={question.sampleAnswer || undefined}
                            isLocked={isLocked}
                            previousSubmission={latestSubmission ? {
                                answerText: latestSubmission.answerText,
                                aiScore: latestSubmission.aiScore || undefined,
                                createdAt: latestSubmission.createdAt.toISOString()
                            } : undefined}
                            history={submissionHistory.map(s => ({
                                id: s.id,
                                answerText: s.answerText,
                                aiScore: s.aiScore || undefined,
                                createdAt: s.createdAt.toISOString()
                            }))}
                        />
                    </div>
                </div>
            </main>
        </div>
    )
}

