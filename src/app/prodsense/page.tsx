import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Sparkles, Brain, Zap, Target, Trophy, Users } from "lucide-react"
import { getTodaysPuzzle, getUserStreak, hasAttemptedToday, getUserAttempt, getPuzzleLeaderboard } from "./actions"
import { PuzzleGame } from "./PuzzleGame"
import { getUser } from "@/lib/auth"

export default async function ProdsensePage() {
    const user = await getUser()
    const puzzle = await getTodaysPuzzle()
    const streak = user ? await getUserStreak() : null
    const attempted = puzzle && user ? await hasAttemptedToday(puzzle.id) : false
    const previousAttempt = puzzle && user ? await getUserAttempt(puzzle.id) : null
    const leaderboard = await getPuzzleLeaderboard()

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 flex flex-col">
            <Header />
            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative py-16 px-4 overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-6xl pointer-events-none">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-100 dark:bg-orange-900/20 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                    </div>

                    <div className="container mx-auto max-w-4xl text-center relative z-10">
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full text-xs font-black mb-8 shadow-lg shadow-orange-500/20">
                            <Zap size={14} />
                            DAILY CHALLENGE
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-gray-900 dark:text-white mb-6">
                            Product <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-500">Puzzles</span>
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto mb-4">
                            One puzzle. Every day. Build your product intuition through bite-sized challenges from real Indian tech scenarios.
                        </p>
                        <p className="text-sm text-gray-500">
                            Solve today's puzzle before midnight to keep your streak alive! 🔥
                        </p>
                    </div>
                </section>

                {/* Main Game Section */}
                <section className="py-8 px-4">
                    <div className="container mx-auto max-w-3xl">
                        {puzzle ? (
                            <PuzzleGame
                                puzzle={puzzle}
                                streak={streak}
                                hasAttempted={attempted}
                                previousAttempt={previousAttempt ? { answer: previousAttempt.answer, isCorrect: previousAttempt.isCorrect } : null}
                                isLoggedIn={!!user}
                            />
                        ) : (
                            <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-16 text-center border border-gray-100 dark:border-gray-800">
                                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Sparkles className="text-gray-400" size={32} />
                                </div>
                                <h2 className="text-2xl font-black mb-4">No Puzzle Today</h2>
                                <p className="text-gray-500">Check back tomorrow for a fresh challenge!</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Leaderboard Section */}
                {leaderboard.length > 0 && (
                    <section className="py-16 px-4">
                        <div className="container mx-auto max-w-3xl">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl font-black mb-2 flex items-center justify-center gap-3">
                                    <Trophy className="text-amber-500" />
                                    Streak Leaders
                                </h2>
                                <p className="text-gray-500">Top product thinkers on Prodsnap</p>
                            </div>

                            <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 overflow-hidden">
                                {leaderboard.map((player, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center gap-4 p-6 ${index !== leaderboard.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''
                                            } ${index < 3 ? 'bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-900/10' : ''}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${index === 0 ? 'bg-amber-500 text-white' :
                                                index === 1 ? 'bg-gray-300 text-gray-700' :
                                                    index === 2 ? 'bg-amber-700 text-white' :
                                                        'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                            }`}>
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold">{player.name}</p>
                                            <p className="text-xs text-gray-500">{player.accuracy}% accuracy</p>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-center">
                                                <p className="text-xl font-black text-orange-500">{player.currentStreak}</p>
                                                <p className="text-[10px] uppercase tracking-widest text-gray-400">Current</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xl font-black text-gray-900 dark:text-white">{player.longestStreak}</p>
                                                <p className="text-[10px] uppercase tracking-widest text-gray-400">Best</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* How It Works */}
                <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900/50">
                    <div className="container mx-auto max-w-6xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-black mb-4">How Product Puzzles <span className="text-blue-600">Work</span></h2>
                            <p className="text-gray-500 max-w-xl mx-auto">Build unstoppable product intuition in just 60 seconds a day.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 text-center group hover:shadow-xl transition-all">
                                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                    <Brain className="text-blue-600" size={28} />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Daily Puzzle</h3>
                                <p className="text-gray-500 text-sm">A fresh product scenario drops every midnight. Real dilemmas from Indian tech companies.</p>
                            </div>
                            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 text-center group hover:shadow-xl transition-all">
                                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                    <Target className="text-orange-600" size={28} />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Build Streaks</h3>
                                <p className="text-gray-500 text-sm">Answer correctly to maintain your streak. Miss a day and it resets. How far can you go?</p>
                            </div>
                            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 text-center group hover:shadow-xl transition-all">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                    <Users className="text-green-600" size={28} />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Compete</h3>
                                <p className="text-gray-500 text-sm">Climb the leaderboard. Compare your product sense with thousands of PM aspirants.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}
