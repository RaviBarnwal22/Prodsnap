import { prisma } from "@/lib/prisma"
import { Header } from "@/components/Header"
import { PracticeQuestionClient } from "@/components/PracticeQuestionClient"
import { getUser } from "@/lib/auth"

export default async function QuestionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const user = await getUser()
    const question = await prisma.practiceQuestion.findUnique({
        where: { id }
    })

    if (!question) {
        return <div>Question not found</div>
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Header />
            <main className="container mx-auto px-4 py-8 grid md:grid-cols-3 gap-8">

                {/* Left Column: Question */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border shadow-sm sticky top-24">
                        <div className="mb-4">
                            <span className="text-xs font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {question.category}
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold mb-4">{question.title}</h1>
                        <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                            {question.description}
                        </p>

                        <div className="mt-8 pt-6 border-t">
                            <h3 className="font-semibold mb-2">Tips</h3>
                            <ul className="text-sm text-gray-500 space-y-2 list-disc pl-4">
                                <li>Clarify the goal first</li>
                                <li>Define user segments</li>
                                <li>Prioritize with reasoning</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Right Column: Answer Area */}
                <div className="md:col-span-2">
                    <PracticeQuestionClient
                        questionId={question.id}
                        userId={user?.id}
                        userEmail={user?.email}
                        userName={user?.firstName || user?.name || ''}
                        category={question.category}
                        solutionText={question.solutionText || undefined}
                        sampleAnswer={question.sampleAnswer || undefined}
                    />
                </div>

            </main>
        </div>
    )
}

